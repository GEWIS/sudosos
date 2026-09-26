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
 * This is the module page of the voucher-group.
 *
 * @module vouchers
 * @mergeTarget
 */

import { Dinero } from 'dinero.js';
import {
  Column, Entity, JoinColumn, OneToMany, OneToOne,
} from 'typeorm';
import BaseEntity from '../base-entity';
import DineroTransformer from '../transformer/dinero-transformer';
// eslint-disable-next-line import/no-cycle
import UserVoucherGroup from './user-voucher-group';
import User from './user';
import VoucherGroupPdf from '../file/voucher-group-pdf';
import { PdfAble } from '../file/pdf-able';
import VoucherGroupPdfService from '../../service/pdf/voucher-group-pdf-service';
import { VOUCHER_GROUP_PDF_LOCATION } from '../../files/storage';

/**
 * @typedef {BaseEntity} VoucherGroup
 * @property {string} name.required - Name of the group.
 * @property {string} activeStartDate.required - Date after which the included cards are active.
 * @property {string} activeEndDate - Date after which cards are no longer active.
 * @property {Array.<User>} vouchers.required - Cards included in this group.
 * @property {string} addressee.required - Name of the purchaser of this group.
 * @property {string} attention - "For the attention of" line for the purchaser.
 * @property {string} street.required - Street of the purchaser.
 * @property {string} postalCode.required - Postal code of the purchaser.
 * @property {string} city.required - City of the purchaser.
 * @property {string} country.required - Country of the purchaser.
 */
@Entity()
export default class VoucherGroup extends PdfAble(BaseEntity) {
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

  /**
   * Name of the purchaser, shown on the voucher group PDF.
   * Groups created before addresses were mandatory have an empty address.
   */
  @Column({ default: '' })
  public addressee: string;

  @Column({ default: '' })
  public attention: string;

  @Column({ default: '' })
  public street: string;

  @Column({ default: '' })
  public postalCode: string;

  @Column({ default: '' })
  public city: string;

  @Column({ default: '' })
  public country: string;

  /**
   * The ID of the statement PDF file
   */
  @Column({ nullable: true })
  public pdfId?: number;

  /**
   * The statement PDF file
   *
   * onDelete: 'CASCADE' is not possible here, because removing the
   * pdf from the database will not remove it from storage
   */
  @OneToOne(() => VoucherGroupPdf, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn()
  public pdf?: VoucherGroupPdf;

  pdfService = new VoucherGroupPdfService(VOUCHER_GROUP_PDF_LOCATION);

  /**
   * A voucher group has no owning account, so the PDF is attributed to the
   * first voucher card of the group.
   */
  async getOwner(): Promise<User> {
    const link = await UserVoucherGroup.findOne({
      where: { voucherGroup: { id: this.id } },
      relations: { user: true },
      order: { userId: 'ASC' },
    });
    return link?.user;
  }
}
