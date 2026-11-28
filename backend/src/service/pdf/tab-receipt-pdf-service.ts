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
 * This is the page of tab-receipt-pdf-service.
 *
 * @module internal/pdf/tab-receipt-pdf-service
 */

import { StoredPdfService } from './pdf-service';
import Tab from '../../entity/tab/tab';
import TabReceiptPdf from '../../entity/file/tab-receipt-pdf';
import Transaction from '../../entity/transactions/transaction';
import User from '../../entity/user/user';
import { TAB_RECEIPT_PDF_LOCATION } from '../../files/storage';
import { createTabReceiptPdf, ITabReceiptItem, ITabReceiptPdf } from '../../html/tab-receipt.html';
import { PdfError } from '../../errors';

export default class TabReceiptPdfService extends StoredPdfService<Tab, TabReceiptPdf, ITabReceiptPdf> {
  readonly location = TAB_RECEIPT_PDF_LOCATION;

  readonly pdfConstructor = TabReceiptPdf;

  render = createTabReceiptPdf;

  getOwner(entity: Tab): User {
    return entity.createdBy;
  }

  /**
   * Collect every product bought on the tab. Rows of the same product
   * revision are merged into one line.
   */
  async getParameters(entity: Tab): Promise<ITabReceiptPdf> {
    if (!entity.paidAt) throw new PdfError('Tab has not been paid.');
    const { transfer } = entity;
    if (!transfer) throw new PdfError('Tab has no settling transfer.');

    const transactions = await this.manager.find(Transaction, {
      where: { from: { id: entity.user.id } },
      relations: {
        subTransactions: {
          subTransactionRows: {
            product: { vat: true },
          },
        },
      },
      order: { createdAt: 'ASC' },
      // Products removed after the purchase must still be on the receipt.
      withDeleted: true,
    });

    const lines = new Map<string, ITabReceiptItem>();
    transactions
      .flatMap((t) => t.subTransactions)
      .flatMap((st) => st.subTransactionRows)
      .forEach((row) => {
        const key = `${row.product.productId}-${row.product.revision}`;
        const line = lines.get(key) ?? {
          description: row.product.name,
          qty: 0,
          unitPriceInclVat: row.product.priceInclVat.getAmount(),
          vatRate: row.product.vat.percentage,
        };
        line.qty += row.amount;
        lines.set(key, line);
      });

    return {
      reference: `SDS-TAB-${String(entity.id).padStart(4, '0')}`,
      paidAt: entity.paidAt.toLocaleDateString('nl-NL'),
      items: Array.from(lines.values()),
      // What was charged on the card, which is what the receipt email says too.
      totalPaid: transfer.amountInclVat.getAmount(),
    };
  }
}
