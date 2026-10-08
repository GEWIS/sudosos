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
 * A `StripeDeposit` is a balance top-up that a user pays online through Stripe. When the
 * payment succeeds, SudoSOS credits the user's {@link balance!Balance | Balance} with a
 * {@link transfers!Transfer | Transfer}.
 *
 * ### Deposit flow
 * 1. The user requests a top-up with `POST /stripe/deposit`. The controller checks the
 *    amount against the limits below.
 * 2. {@link StripeService.createStripeDeposit | createStripeDeposit} creates a
 *    PaymentIntent at Stripe and stores it as a {@link StripePaymentIntent}. It then saves
 *    a {@link StripeDeposit} that links the intent to the user (`to`). The response holds
 *    the client secret that the dashboard needs to show Stripe's payment form.
 *    `GET /stripe/public` returns the matching publishable key.
 * 3. The user pays on Stripe's side.
 * 4. Stripe calls `POST /stripe/webhook` for every PaymentIntent event. The controller
 *    verifies the signature and ignores events whose `metadata.service` is not this
 *    SudoSOS instance. Once it has found the stored intent, it answers `204` and processes
 *    the event afterwards. Stripe therefore never sees a failure during processing; such
 *    failures are only logged.
 * 5. {@link StripeWebhookService} stores five event types as a
 *    {@link StripePaymentIntentStatus}: `payment_intent.created`, `.processing`,
 *    `.succeeded`, `.payment_failed` and `.canceled`. Other events, such as
 *    `payment_intent.requires_action`, are logged and ignored.
 *    On `SUCCEEDED`, {@link StripeService.handleStripeDepositPaid | handleStripeDepositPaid}
 *    creates the transfer with `from = null` and `to = user`, and saves it on the deposit.
 *
 * ### Payment intent status
 * The status of an intent is its latest {@link StripePaymentIntentStatus}. The states are
 * `CREATED`, `PROCESSING`, `SUCCEEDED`, `FAILED` and `CANCELLED`. Each state is stored at
 * most once per intent, and only one of the three final states can exist. A deposit
 * without a `transfer` has not been paid yet. `GET /users/{id}/deposits` lists those that
 * are still processing.
 *
 * ### Top-up limits
 * The limits come from the Stripe section of the configuration:
 * - The amount must be at least `minTopupAmount`. A smaller amount is accepted only if it
 *   brings a negative balance exactly to zero.
 * - The balance after the top-up may not exceed `maxBalanceAmount`.
 *
 * ### Other Stripe payments
 * {@link StripePaymentIntent} is shared with two other features. Each settles its own
 * transfer when the intent succeeds, and neither creates a `StripeDeposit`:
 * - {@link stripe/payment-request} -- a shareable payment link that tops up a given user
 *   without logging in.
 * - {@link stripe/terminal-payment} -- a card payment on a Stripe Terminal reader at a
 *   point of sale.
 *
 * For API interactions, refer to the [Swagger Documentation](https://sudosos.gewis.nl/api/api-docs/#/stripe).
 *
 * @module stripe
 * @mergeTarget
 */

import {
  Entity, JoinColumn, ManyToOne, OneToOne,
} from 'typeorm';
import BaseEntity from '../base-entity';
import User from '../user/user';
import Transfer from '../transactions/transfer';
import StripePaymentIntent from './stripe-payment-intent';

@Entity()
export default class StripeDeposit extends BaseEntity {
  @ManyToOne(() => User, { nullable: false, eager: true, onDelete: 'CASCADE' })
  @JoinColumn()
  public to: User;

  @OneToOne(() => Transfer, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  public transfer?: Transfer;

  @OneToOne(() => StripePaymentIntent, { nullable: false, eager: true, onDelete: 'RESTRICT' })
  @JoinColumn()
  public stripePaymentIntent: StripePaymentIntent;
}
