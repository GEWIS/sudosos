import { defineStore } from 'pinia';
import type { StripePaymentTerminalResponse, TerminalPaymentResponse, TransactionRequest } from '@gewis/sudosos-client';
import { useWebSocketStore } from '@sudosos/sudosos-frontend-common';
import type { Socket } from 'socket.io-client';
import { posApiService } from '@/services/ApiService';

/**
 * Mirror of the backend's TerminalPaymentState. The generated client types
 * `state` as a bare string, so the union lives here.
 */
export type TerminalPaymentState = 'created' | 'processing' | 'paid' | 'cancelled';

/**
 * What the cashier is currently looking at: `preparing` while we resolve the
 * reader and register the payment, `waiting` once the reader is asking for a
 * card and we're polling for the result, then `paid` or `cancelled` once
 * Stripe or the cashier settles it.
 */
export type TerminalPaymentPhase = 'idle' | 'preparing' | 'waiting' | 'paid' | 'cancelled' | 'error';

/**
 * Thrown when we cannot decide which reader to send a payment to. A POS is
 * assumed to have exactly one reader next to it; anything else needs a human.
 */
export class TerminalUnavailableError extends Error {
  public readonly reason: 'none' | 'multiple';

  public constructor(public readonly available: number) {
    super(`Expected exactly one available Stripe terminal, found ${available}`);
    this.name = 'TerminalUnavailableError';
    this.reason = available === 0 ? 'none' : 'multiple';
  }
}

/** Socket.IO event the backend emits whenever a terminal payment changes state. */
const TERMINAL_PAYMENT_EVENT = 'terminal_payment:updated';

/**
 * Room carrying updates for one payment. Underscores are load-bearing: the
 * backend parses room names as `[a-z_]+:{id}:[a-z_]+`, so a hyphenated variant
 * silently fails to parse and nothing is ever delivered.
 */
const roomFor = (id: number): string => `terminal_payment:${id}:updates`;

const isSettled = (state: string): boolean => state === 'paid' || state === 'cancelled';

const statusOf = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } })?.response?.status;

/**
 * Turn a failed terminal lookup into something a cashier can act on.
 *
 * The whole /terminal-payments router only exists when the server has Stripe
 * configured, so a 404 here means card payments are switched off rather than
 * that a reader is missing.
 */
const describeTerminalLookupFailure = (error: unknown): string => {
  if (error instanceof TerminalUnavailableError) {
    return error.reason === 'none'
      ? 'No payment terminal is available. Is it switched on and connected?'
      : `Found ${error.available} available payment terminals, so it is unclear which one to use. Ask a bar manager to sort this out.`;
  }

  if (statusOf(error) === 404) {
    return 'Card payments are not enabled on this SudoSOS server.';
  }

  return 'Could not reach the payment terminal.';
};

interface TerminalPaymentState_ {
  payment: TerminalPaymentResponse | null;
  phase: TerminalPaymentPhase;
  errorMessage: string | null;
}

/**
 * The active subscription's teardown. Deliberately module-level rather than
 * store state: it is not data, and keeping listeners out of the store stops
 * Pinia devtools from trying to serialise them.
 */
let unsubscribe: (() => void) | null = null;

export const useTerminalPaymentStore = defineStore('terminalPayment', {
  state: (): TerminalPaymentState_ => ({
    payment: null,
    phase: 'idle',
    errorMessage: null,
  }),
  getters: {
    getPayment(): TerminalPaymentResponse | null {
      return this.payment;
    },
    /** The backend's state for the active payment, narrowed from the client's bare string. */
    paymentState(): TerminalPaymentState | null {
      return (this.payment?.state as TerminalPaymentState | undefined) ?? null;
    },
    /** True while the reader is busy and the cashier can only wait or cancel. */
    isWaiting(): boolean {
      return this.phase === 'waiting';
    },
  },
  actions: {
    /**
     * Resolve the single available Stripe reader for this POS.
     * @throws {TerminalUnavailableError} when there is not exactly one.
     */
    async resolveTerminal(): Promise<StripePaymentTerminalResponse> {
      const terminals = await posApiService.terminalPayments.getStripeTerminals().then((res) => res.data);
      const available = terminals.filter((t) => t.available);

      if (available.length !== 1) {
        throw new TerminalUnavailableError(available.length);
      }

      return available[0]!;
    },

    /**
     * Register the transaction as a terminal payment and push it to the reader.
     *
     * The reader is resolved *before* the payment is created: creating one
     * leaves a temporary transaction and a Stripe payment intent behind, so we
     * only do that once we know there is somewhere to send it. If handing the
     * payment to the reader then fails, the just-created payment is cancelled
     * so it does not linger in `created` forever.
     */
    async startPayment(request: TransactionRequest): Promise<void> {
      this.stopListening();
      this.payment = null;
      this.errorMessage = null;
      this.phase = 'preparing';

      let terminal: StripePaymentTerminalResponse;
      try {
        terminal = await this.resolveTerminal();
      } catch (error) {
        this.phase = 'error';
        this.errorMessage = describeTerminalLookupFailure(error);
        throw error;
      }

      const payment = await posApiService.terminalPayments
        .createTerminalPayment({ createTerminalPaymentRequest: { transaction: request } })
        .then((res) => res.data);
      this.payment = payment;

      // Subscribe before the reader is engaged. The backend emits `processing`
      // from the same request that starts the payment, and a contactless tap can
      // settle it within a second, so listening afterwards can miss both.
      this.phase = 'waiting';
      if (!this.listenFor(payment.id)) {
        await this.cancelPayment().catch(() => undefined);
        this.phase = 'error';
        this.errorMessage = 'No connection to SudoSOS, so the payment cannot be followed. Check the network.';
        throw new Error('Cannot follow a terminal payment without a websocket connection');
      }

      try {
        await posApiService.terminalPayments.startTerminalPayment({
          id: payment.id,
          processTerminalPaymentRequest: { stripeTerminalId: terminal.id },
        });
      } catch (error) {
        // Nothing is on the reader, so drop the payment rather than leaving it
        // dangling and holding a Stripe payment intent open.
        await this.cancelPayment().catch(() => undefined);
        this.phase = 'error';
        this.errorMessage = 'The payment terminal did not accept the payment. Please try again.';
        throw error;
      }

      // Covers the window between subscribing and the room join completing.
      await this.reconcile();
    },

    /**
     * Apply a state the backend reported for the active payment.
     *
     * Ignores updates for any other payment, and anything arriving once we have
     * stopped waiting, so a late push cannot resurrect a closed dialog.
     */
    applyUpdate(payment: TerminalPaymentResponse): void {
      if (this.phase !== 'waiting' || payment.id !== this.payment?.id) return;

      this.payment = payment;
      if (isSettled(payment.state)) {
        this.phase = payment.state === 'paid' ? 'paid' : 'cancelled';
        this.stopListening();
      }
    },

    /**
     * Subscribe to this payment's room and apply pushed state changes.
     *
     * Two fetches remain, both one-shot rather than a loop:
     *  - immediately after subscribing, because joining a room is asynchronous
     *    server-side and a fast reader could settle the payment before the join
     *    completes
     *  - after a reconnect, since anything emitted while the socket was down is
     *    gone for good
     * @param id ID of the payment to follow.
     * @returns False when there is no socket to listen on. Reporting that is
     * left to the caller, which has to undo the payment first -- cancelling
     * moves the phase to `cancelled` and would overwrite an error set here.
     */
    listenFor(id: number): boolean {
      this.stopListening();

      let socket: Socket;
      try {
        socket = useWebSocketStore().getSocket;
      } catch {
        return false;
      }

      const room = roomFor(id);
      const onUpdate = (payment: TerminalPaymentResponse) => this.applyUpdate(payment);
      const onConnect = () => {
        socket.emit('subscribe', room);
        void this.reconcile();
      };

      socket.emit('subscribe', room);
      socket.on(TERMINAL_PAYMENT_EVENT, onUpdate);
      socket.on('connect', onConnect);

      unsubscribe = () => {
        socket.off(TERMINAL_PAYMENT_EVENT, onUpdate);
        socket.off('connect', onConnect);
        socket.emit('unsubscribe', room);
        unsubscribe = null;
      };
      return true;
    },

    stopListening(): void {
      unsubscribe?.();
    },

    /**
     * Read the payment's committed state once, to close the gap around
     * subscribing and reconnecting.
     */
    async reconcile(): Promise<void> {
      if (this.phase !== 'waiting' || !this.payment) return;

      try {
        const payment = await posApiService.terminalPayments
          .getSingleTerminalPayment({ id: this.payment.id })
          .then((res) => res.data);
        this.applyUpdate(payment);
      } catch (error) {
        if (this.phase !== 'waiting') return;

        // Once Stripe cancels a payment the backend detaches its temporary
        // transaction, which can drop our POS token out of the `own` relation
        // and make this endpoint 403. Treat losing access, or the payment
        // disappearing, as a cancellation.
        const status = statusOf(error);
        if (status === 403 || status === 404) {
          this.phase = 'cancelled';
          this.stopListening();
        }
        // Anything else is left alone: the subscription is the primary channel
        // and a failed reconcile does not mean the payment is lost.
      }
    },

    /**
     * Cancel the in-flight payment, both on the reader and in SudoSOS. Safe to
     * call when there is nothing to cancel.
     */
    async cancelPayment(): Promise<void> {
      this.stopListening();
      const payment = this.payment;
      if (!payment) return;

      const response = await posApiService.terminalPayments.cancelTerminalPayment({ id: payment.id });
      this.payment = response.data;
      this.phase = 'cancelled';
    },

    reset(): void {
      this.stopListening();
      this.payment = null;
      this.phase = 'idle';
      this.errorMessage = null;
    },
  },
});
