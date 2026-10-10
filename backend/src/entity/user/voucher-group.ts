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
 * A `VoucherGroup` is a batch of pre-paid accounts, for example for guests at an event.
 * Each voucher in the group is a {@link users!User | User} of type
 * {@link users!UserType.VOUCHER | VOUCHER} that starts with the same balance.
 *
 * ### Creating a group
 * `POST /vouchergroups` takes a `name`, an active period (`activeStartDate`,
 * `activeEndDate`), a `balance` per voucher and the number of vouchers (`amount`). The
 * start date is rounded down to 00:00 and the end date up to 23:59:59. The end date may not
 * be in the past, and the balance must be positive.
 * {@link VoucherGroupService.createVoucherGroup | createVoucherGroup} then:
 * - creates `amount` users named `<name>_0`, `<name>_1`, and so on, that are active only if
 *   the start date has passed;
 * - saves the {@link VoucherGroup} and a {@link UserVoucherGroup} row for each user;
 * - credits each user with a {@link transfers!Transfer | Transfer} of `balance` with
 *   `from = null`.
 *
 * ### Updating a group
 * `PATCH /vouchergroups/{id}` is only allowed before the group's stored start date. After
 * that, `VoucherGroupController.updateVoucherGroup` answers `403`. It also refuses with
 * `400` a request that lowers `amount`. An allowed update replaces the group's fields and
 * brings the vouchers in line:
 * - every voucher gets a transfer for the difference between the new and the old
 *   `balance`. This also happens when the balance is unchanged, which writes a zero-amount
 *   transfer per voucher;
 * - if `amount` grows, the missing vouchers are created and credited;
 * - if the new start date has passed, all vouchers are activated. Moving the start date
 *   to today or earlier is therefore the only way to activate them through the API.
 *
 * ### Spending
 * The backend has no checkout logic specific to vouchers. A voucher buys like any other
 * user with the `Buyer` role, and cannot go into debt because `canGoIntoDebt` is `false`.
 *
 * `TransactionService` refuses purchases by inactive users. No process watches the active
 * period. Vouchers of a group created before its start date stay inactive when that date
 * arrives, unless the start date is moved as described above. Nothing deactivates them
 * when `activeEndDate` passes.
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
