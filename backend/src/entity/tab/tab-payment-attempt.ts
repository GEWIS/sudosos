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
 * This is the module page of the tab-payment-attempt.
 *
 * @module tabs
 */

import {
  Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn,
} from 'typeorm';
import BaseEntityWithoutId from '../base-entity-without-id';
import type Tab from './tab';
import StripePaymentIntent from '../stripe/stripe-payment-intent';

/**
 * One attempt to pay a {@link Tab} on a Stripe Terminal. A tab may have many
 * attempts (declined cards, cancelled payments), but at most one of them ever
 * reaches `SUCCEEDED`.
 */
@Entity()
export default class TabPaymentAttempt extends BaseEntityWithoutId {
  @PrimaryColumn()
  public tabId: number;

  @ManyToOne('Tab', (t: Tab) => t.attempts, { onDelete: 'RESTRICT', nullable: false })
  @JoinColumn({ name: 'tabId' })
  public tab: Tab;

  @PrimaryColumn()
  public paymentIntentId: number;

  @OneToOne(() => StripePaymentIntent, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'paymentIntentId' })
  public paymentIntent: StripePaymentIntent;

  /** The ID of the Stripe Terminal (reader) that handles this attempt. */
  @Column({ type: 'varchar', length: 64 })
  public processedByTerminal: string;
}
