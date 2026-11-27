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
 * A `StripeDeposit` is a balance top-up that a user pays online through Stripe. When the payment
 * succeeds, SudoSOS credits the user with a {@link transfers!Transfer | Transfer}.
 *
 * ### Flow
 * 1. `POST /stripe/deposit` checks the amount.
 *    {@link StripeService.createStripeDeposit | createStripeDeposit} creates a
 *    {@link StripePaymentIntent} at Stripe and a {@link StripeDeposit}. The response holds the
 *    client secret for Stripe's payment form. `GET /stripe/public` returns the publishable key.
 * 2. The user pays at Stripe.
 * 3. Stripe calls `POST /stripe/webhook`. {@link StripeWebhookService} stores each status change as
 *    a {@link StripePaymentIntentStatus}.
 * 4. On `SUCCEEDED`, {@link StripeService.handleStripeDepositPaid | handleStripeDepositPaid} creates
 *    the transfer and links it to the deposit.
 *
 * A deposit without a `transfer` is not paid yet.
 *
 * ### Limits
 * Both come from the Stripe configuration:
 * - The amount must be at least `minTopupAmount`, unless it brings a negative balance exactly to zero.
 * - The balance after the top-up may not exceed `maxBalanceAmount`.
 *
 * ### Other Stripe payments
 * {@link StripePaymentIntent} is also used by:
 * - {@link stripe/payment-request | Payment requests}: a shareable link that tops up a user without
 *   logging in.
 * - {@link stripe/terminal-payment | Terminal payments}: card payments on a Stripe Terminal reader at
 *   a point of sale.
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
