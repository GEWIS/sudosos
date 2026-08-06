import { defineStore } from 'pinia';
import type { StripePaymentTerminalResponse, TerminalPaymentResponse, TransactionRequest } from '@gewis/sudosos-client';
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

const POLL_INTERVAL_MS = 2000;

/**
 * How many consecutive polling errors we tolerate before giving up. Polling
 * rides on the network, so a single blip should not kill an in-flight payment.
 */
const MAX_POLL_FAILURES = 3;

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
 * Timer handle for the polling loop. Deliberately module-level rather than
 * store state: it is not data, and keeping it out of the store stops Pinia
 * devtools from trying to serialise a timer.
 */
let pollTimer: ReturnType<typeof setTimeout> | undefined;

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
      this.stopPolling();
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

      this.phase = 'waiting';
      this.scheduleNextPoll();
    },

    /**
     * Poll the payment until it is paid or cancelled. Scheduled with setTimeout
     * rather than setInterval so a slow response cannot overlap requests.
     */
    scheduleNextPoll(failures = 0): void {
      pollTimer = setTimeout(() => {
        void this.pollOnce(failures);
      }, POLL_INTERVAL_MS);
    },

    async pollOnce(failures: number): Promise<void> {
      // A cancel or unmount may have landed while the timer was pending.
      if (this.phase !== 'waiting' || !this.payment) return;

      try {
        const payment = await posApiService.terminalPayments
          .getSingleTerminalPayment({ id: this.payment.id })
          .then((res) => res.data);

        if (this.phase !== 'waiting') return;
        this.payment = payment;

        if (isSettled(payment.state)) {
          this.phase = payment.state === 'paid' ? 'paid' : 'cancelled';
          return;
        }

        this.scheduleNextPoll();
      } catch (error) {
        if (this.phase !== 'waiting') return;

        // Once Stripe cancels a payment the backend detaches its temporary
        // transaction, which can drop our POS token out of the `own` relation
        // and make this endpoint 403. Treat losing access, or the payment
        // disappearing, as a cancellation rather than retrying forever.
        const status = statusOf(error);
        if (status === 403 || status === 404) {
          this.phase = 'cancelled';
          return;
        }

        if (failures + 1 >= MAX_POLL_FAILURES) {
          this.phase = 'error';
          this.errorMessage =
            'Lost contact with SudoSOS while waiting for the payment. Check the terminal before retrying.';
          return;
        }

        this.scheduleNextPoll(failures + 1);
      }
    },

    stopPolling(): void {
      clearTimeout(pollTimer);
      pollTimer = undefined;
    },

    /**
     * Cancel the in-flight payment, both on the reader and in SudoSOS. Safe to
     * call when there is nothing to cancel.
     */
    async cancelPayment(): Promise<void> {
      this.stopPolling();
      const payment = this.payment;
      if (!payment) return;

      const response = await posApiService.terminalPayments.cancelTerminalPayment({ id: payment.id });
      this.payment = response.data;
      this.phase = 'cancelled';
    },

    reset(): void {
      this.stopPolling();
      this.payment = null;
      this.phase = 'idle';
      this.errorMessage = null;
    },
  },
});
