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
 * A `VoucherGroup` is a batch of pre-paid accounts, for example for guests at an event. Each
 * voucher is a {@link users!User | User} of type {@link users!UserType.VOUCHER | VOUCHER} with the
 * same starting balance.
 *
 * ### Creating
 * `POST /vouchergroups` takes a `name`, an active period, a `balance` per voucher and the number of
 * vouchers (`amount`). {@link VoucherGroupService.createVoucherGroup | createVoucherGroup} creates
 * the users `<name>_0`, `<name>_1`, and so on, links them with {@link UserVoucherGroup}, and credits
 * each with a {@link transfers!Transfer | Transfer}.
 *
 * ### Updating
 * `PATCH /vouchergroups/{id}` is only allowed before the start date and cannot lower `amount`. A
 * new `balance` is applied to every voucher with a transfer for the difference. When `amount` grows,
 * the extra vouchers are created.
 *
 * ### Spending
 * A voucher buys like any other `Buyer`, but cannot go into debt. Only active vouchers can buy.
 * Vouchers are activated when the group is created or updated after its start date, or one by one
 * by an admin.
 *
 * For API interactions, refer to the [Swagger Documentation](https://sudosos.gewis.nl/api/api-docs/#/vouchergroups).
 *
 * @module vouchers
 * @mergeTarget
 */

import { Dinero } from 'dinero.js';
import {
  Column, Entity, OneToMany,
} from 'typeorm';
import BaseEntity from '../base-entity';
import DineroTransformer from '../transformer/dinero-transformer';
// eslint-disable-next-line import/no-cycle
import UserVoucherGroup from './user-voucher-group';

/**
 * @typedef {BaseEntity} VoucherGroup
 * @property {string} name.required - Name of the group.
 * @property {string} activeStartDate.required - Date after which the included cards are active.
 * @property {string} activeEndDate - Date after which cards are no longer active.
 * @property {Array.<User>} vouchers.required - Cards included in this group.
 */
@Entity()
export default class VoucherGroup extends BaseEntity {
  @Column({
    unique: true,
    length: 64,
  })
  public name: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  public activeStartDate: Date;

  @Column({
    type: 'datetime',
  })
  public activeEndDate: Date;

  @Column({
    type: 'integer',
  })
  public amount: number;

  @Column({
    type: 'integer',
    transformer: DineroTransformer.Instance,
  })
  public balance: Dinero;

  @OneToMany(() => UserVoucherGroup, (user) => user.voucherGroup)
  public vouchers: UserVoucherGroup[];
}
