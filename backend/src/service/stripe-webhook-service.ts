/**
 *  SudoSOS back-end API service.
 *  Copyright (C) 2026 Study association GEWIS
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *  @license
 */

/**
 * This is the module page of the stripe-webhook-service.
 *
 * @module stripe
 */

import log4js, { Logger } from 'log4js';
import WithManager from '../database/with-manager';
import { EntityManager } from 'typeorm';
import Stripe from 'stripe';
import StripePaymentIntent from '../entity/stripe/stripe-payment-intent';
import StripePaymentIntentStatus, { StripePaymentIntentState } from '../entity/stripe/stripe-payment-intent-status';
import Config from '../config';
import StripeService, { StripeFactory } from './stripe-service';
import PaymentRequestService from './payment-request-service';
import TerminalPaymentService from './terminal-payment-service';
import { TerminalPaymentState } from '../entity/transactions/terminal/terminal-payment';

export default class StripeWebhookService extends WithManager {
  private stripe: Stripe;

  private logger: Logger;

  constructor(manager?: EntityManager) {
    super(manager);
    this.stripe = StripeFactory.create();
    this.logger = log4js.getLogger('StripeWebhookService');
  }

  /**
   * Validate a Stripe webhook event
   * @param body
   * @param signature
   */
  public async constructWebhookEvent(
    body: any, signature: string | string[],
  ): Promise<Stripe.Event> {
    const webhookSecret = Config.get().stripe.webhookSecret;
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set.');
    }

    return this.stripe.webhooks.constructEvent(body, signature, webhookSecret);
  }

  /**
   * Append a new status to a {@link StripePaymentIntent} and, when the new
   * state is terminal, run the side effects for whatever the intent is linked
   * to. On `SUCCEEDED` this settles the deposit (and marks any linked
   * PaymentRequest as paid) or finalises the terminal payment; on `CANCELLED`
   * it propagates a Stripe-initiated cancellation to a linked terminal payment.
   *
   * `FAILED` only records a declined attempt. It is not final at Stripe: the
   * same intent can still succeed (after a PIN prompt, or with another card)
   * or be cancelled. A declined terminal payment is ended by
   * {@link handleReaderActionFailed} instead.
   *
   * Rejects when the intent does not exist, when the status already exists, or
   * when it would conflict with a final state already present
   * (SUCCEEDED/CANCELLED).
   * @param paymentIntentId The local (database) ID of the payment intent.
   * @param state The new state to record.
   * @returns The persisted {@link StripePaymentIntentStatus}.
   */
  public async createNewPaymentIntentStatus(
    paymentIntentId: number, state: StripePaymentIntentState,
  ): Promise<StripePaymentIntentStatus> {
    const paymentIntent = await this.manager.getRepository(StripePaymentIntent)
      .findOne({ where: { id: paymentIntentId }, relations: { deposit: true, paymentRequestAttempt: { paymentRequest: true }, terminalPayment: true } });
    if (!paymentIntent) {
      throw new Error(`PaymentIntent with id "${paymentIntentId}" not found.`);
    }

    const states = paymentIntent.paymentIntentStatuses?.map((status) => status.state) ?? [];
    const mutuallyExclusiveStates = [
      StripePaymentIntentState.SUCCEEDED,
      StripePaymentIntentState.CANCELLED,
    ];
    if (states.includes(state)) throw new Error(`Status ${state} already exists.`);
    if (mutuallyExclusiveStates.includes(state)) {
      const forbiddenStates = [...mutuallyExclusiveStates];
      forbiddenStates.splice(forbiddenStates.indexOf(state), 1);
      for (const s of forbiddenStates) {
        if (states.includes(s)) throw new Error(`Cannot create status ${StripePaymentIntentState[state]}, because ${StripePaymentIntentState[s]} already exists`);
      }
    }

    const paymentIntentStatus = await this.manager.getRepository(StripePaymentIntentStatus)
      .save({ stripePaymentIntent: paymentIntent, state });

    // If payment has succeeded, settle whichever consumer this intent
    // belongs to. A deposit and a PaymentRequest are mutually exclusive on a
    // given intent, each with its own settlement path: a deposit already
    // has a StripeDeposit row, so StripeService.handleStripeDepositPaid
    // creates its Transfer; a PaymentRequest-originated intent never gets a
    // StripeDeposit row, so PaymentRequestService.settlePaidStripeIntent
    // creates its Transfer and marks the request PAID in one step.
    if (state === StripePaymentIntentState.SUCCEEDED && !!paymentIntent.deposit) {
      await new StripeService(this.manager).handleStripeDepositPaid(paymentIntent);
    }
    if (state === StripePaymentIntentState.SUCCEEDED && !!paymentIntent.paymentRequestAttempt) {
      // Best-effort on the PaymentRequest side only: if the credit Transfer
      // is created but the subsequent state-machine flip to PAID conflicts
      // (e.g. an admin cancelled the request after the intent was created),
      // that must not undo the Transfer — log and continue. The user is
      // credited either way; reconciling the PaymentRequest state is a
      // secondary concern.
      try {
        await new PaymentRequestService(this.manager).settlePaidStripeIntent(paymentIntent);
      } catch (error) {
        this.logger.error(
          'Failed to fully settle a succeeded Stripe payment intent for a PaymentRequest.',
          {
            paymentIntentId: paymentIntent.id,
            stripeId: paymentIntent.stripeId,
            paymentRequestId: paymentIntent.paymentRequestAttempt.paymentRequest.id,
            error,
          },
        );
      }
    }
    if (state === StripePaymentIntentState.SUCCEEDED && !!paymentIntent.terminalPayment) {
      await new TerminalPaymentService(this.manager).handleTerminalPaymentSuccess(paymentIntent);
    }

    // If payment is cancelled, propagate this to appropriate entity if cancellation is done by Stripe (and not SudoSOS)
    if (state === StripePaymentIntentState.CANCELLED && StripeWebhookService.terminalPaymentIsOpen(paymentIntent)) {
      await new TerminalPaymentService(this.manager).cancelTerminalPayment(paymentIntent.terminalPayment.id, false);
    }

    return paymentIntentStatus;
  }

  /**
   * End the terminal payment of a reader action that failed.
   *
   * This, and not `payment_intent.payment_failed`, ends a terminal payment.
   * The intent fails on every declined attempt, including a soft decline that
   * asks for a PIN, after which the reader carries on with the same payment.
   * The reader action only fails once the reader has stopped.
   *
   * - `customer_canceled`: the customer pressed cancel, so the payment is
   *   cancelled, and so is its intent at Stripe.
   * - `connection_error`: the reader lost its connection, but the payment may
   *   still have been authorised, so the payment stays open. A succeeded
   *   webhook settles it, or the cashier cancels it.
   * - Anything else, such as a decline: the payment fails.
   * @param paymentIntent The payment intent the reader was processing, with its
   * statuses and terminal payment.
   * @param reader The reader from the `terminal.reader.action_failed` event.
   */
  private async handleReaderActionFailed(paymentIntent: StripePaymentIntent, reader: Stripe.Terminal.Reader): Promise<void> {
    // Webhooks for intents SudoSOS ended itself, or that are not terminal payments
    if (!StripeWebhookService.terminalPaymentIsOpen(paymentIntent)) return;

    const terminalPaymentId = paymentIntent.terminalPayment.id;
    const failureCode = reader.action?.failure_code;
    const service = new TerminalPaymentService(this.manager);

    if (failureCode === 'connection_error') {
      this.logger.warn(`Reader "${reader.id}" lost its connection while processing terminal payment ${terminalPaymentId}, so it is left open`);
      return;
    }

    if (failureCode === 'customer_canceled') {
      // The reader has stopped, but the intent is still open at Stripe. Cancel
      // it there too, which also marks the payment as cancelled rather than
      // declined if the card had a soft decline first.
      const terminalPayment = await service.cancelTerminalPayment(terminalPaymentId, false);
      await new StripeService(this.manager).cancelPaymentIntent(terminalPayment.stripePaymentIntent);
      return;
    }

    // The FAILED status marks the terminal payment as failed rather than
    // cancelled. Its own webhook may arrive after this one, so record it now.
    await this.recordDecline(paymentIntent.id);
    await service.failTerminalPayment(terminalPaymentId);
  }

  /**
   * Record a FAILED status for the payment intent, unless it already has one.
   *
   * A decline sends both `payment_intent.payment_failed` and
   * `terminal.reader.action_failed`, often at the same moment. Each is handled
   * in its own database transaction, so neither sees the status the other is
   * inserting. The insert is ignored rather than rejected by the unique index,
   * so the handler that loses this race still ends the terminal payment.
   * @param paymentIntentId The local (database) ID of the payment intent.
   */
  private async recordDecline(paymentIntentId: number): Promise<void> {
    await this.manager.createQueryBuilder()
      .insert()
      .into(StripePaymentIntentStatus)
      .values({ stripePaymentIntentId: paymentIntentId, state: StripePaymentIntentState.FAILED })
      .orIgnore()
      .execute();
  }

  /**
   * Whether the payment intent belongs to a terminal payment that can still be
   * paid. Only such a payment can still be cancelled or failed; this also skips
   * the webhooks caused by SudoSOS ending a payment itself.
   * @param paymentIntent The payment intent, with its terminal payment.
   */
  private static terminalPaymentIsOpen(paymentIntent: StripePaymentIntent): boolean {
    return !!paymentIntent.terminalPayment
      && [TerminalPaymentState.CREATED, TerminalPaymentState.PROCESSING].includes(paymentIntent.terminalPayment.getState());
  }

  /**
   * Get the Stripe ID of the payment intent a webhook event is about. For a
   * `terminal.reader.action_failed` event, this is the intent the reader was
   * processing.
   * @param event Event received from the Stripe webhook.
   * @returns The Stripe ID, or `undefined` if the event is not about a payment intent.
   */
  public static getPaymentIntentStripeId(event: Stripe.Event): string | undefined {
    if (event.type.startsWith('payment_intent.')) {
      return (event.data.object as Stripe.PaymentIntent).id;
    }
    if (event.type === 'terminal.reader.action_failed') {
      const intent = event.data.object.action?.process_payment_intent?.payment_intent;
      return typeof intent === 'string' ? intent : intent?.id;
    }
    return undefined;
  }

  /**
   * Handle the event by making the appropriate database additions
   * @param event {Stripe.Event} Event received from Stripe webhook
   */
  public async handleWebhookEvent(event: Stripe.Event) {
    try {
      const stripeId = StripeWebhookService.getPaymentIntentStripeId(event);
      const paymentIntent = await StripePaymentIntent.findOne({
        where: { stripeId },
        relations: {
          deposit: { transfer: true },
          paymentIntentStatuses: true,
          paymentRequestAttempt: { paymentRequest: true },
          terminalPayment: true,
        },
      });

      if (!paymentIntent) {
        throw new Error(`Could not find payment intent with ID "${stripeId}"`);
      }

      switch (event.type) {
        case 'payment_intent.created':
          await this.createNewPaymentIntentStatus(paymentIntent.id, StripePaymentIntentState.CREATED);
          break;
        case 'payment_intent.processing':
          await this.createNewPaymentIntentStatus(paymentIntent.id, StripePaymentIntentState.PROCESSING);
          break;
        case 'payment_intent.succeeded':
          await this.createNewPaymentIntentStatus(paymentIntent.id, StripePaymentIntentState.SUCCEEDED);
          break;
        case 'payment_intent.payment_failed':
          // Sent for every declined attempt, and a failed reader action may
          // already have recorded the decline. Record it once.
          await this.recordDecline(paymentIntent.id);
          break;
        case 'payment_intent.canceled':
          await this.createNewPaymentIntentStatus(paymentIntent.id, StripePaymentIntentState.CANCELLED);
          break;
        case 'terminal.reader.action_failed':
          await this.handleReaderActionFailed(paymentIntent, event.data.object);
          break;
        default:
          this.logger.warn('Tried to process event', event.type, 'but processing method is not defined');
      }

      this.logger.trace(`Successfully processed event "${event.type}" for payment intent "${stripeId}" (ID: ${paymentIntent.id})`);
    } catch (error) {
      this.logger.error('Could not process Stripe webhook event with ID', event.id, error);
    }
  }
}
