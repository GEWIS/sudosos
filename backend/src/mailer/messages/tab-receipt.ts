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
 * This is the module page of the tab-receipt.
 *
 * @module internal/mailer
 */

import MailContentBuilder from './mail-content-builder';
import MailMessage, { Language, MailLanguageMap } from '../mail-message';
import { escapeHtml } from '../../html/escape';

export interface TabReceiptOptions {
  tabName: string;
  /** The paid amount, already formatted. */
  amount: string;
}

const tabReceiptDutch = new MailContentBuilder<TabReceiptOptions>({
  getHTML: (context) => `
<p>Bedankt voor je betaling van <strong>${escapeHtml(context.amount)}</strong> voor de rekening "${escapeHtml(context.tabName)}".</p>
<p>In de bijlage vind je de bon met alle aankopen op deze rekening.</p>
<p>Heb je vragen over deze bon? Neem dan contact op via het e-mailadres in de footer van deze e-mail.</p>`,
  getSubject: (context) => `Bon voor ${context.tabName}`,
  getTitle: 'Bon',
  getText: (context) => `
Bedankt voor je betaling van ${context.amount} voor de rekening "${context.tabName}".
In de bijlage vind je de bon met alle aankopen op deze rekening.
Heb je vragen over deze bon? Neem dan contact op via het e-mailadres in de footer van deze e-mail.`,
  getReasonForEmail: 'Je ontvangt deze e-mail omdat je de contactpersoon van deze rekening bent.',
});

const tabReceiptEnglish = new MailContentBuilder<TabReceiptOptions>({
  getHTML: (context) => `
<p>Thank you for your payment of <strong>${escapeHtml(context.amount)}</strong> for the tab "${escapeHtml(context.tabName)}".</p>
<p>Attached is the receipt with all purchases on this tab.</p>
<p>If you have any questions about this receipt, please reach out to the email address in the footer of this email.</p>`,
  getSubject: (context) => `Receipt for ${context.tabName}`,
  getTitle: 'Receipt',
  getText: (context) => `
Thank you for your payment of ${context.amount} for the tab "${context.tabName}".
Attached is the receipt with all purchases on this tab.
If you have any questions about this receipt, please reach out to the email address in the footer of this email.`,
  getReasonForEmail: 'You receive this email because you are the contact person of this tab.',
});

const mailContents: MailLanguageMap<TabReceiptOptions> = {
  [Language.DUTCH]: tabReceiptDutch,
  [Language.ENGLISH]: tabReceiptEnglish,
};

export default class TabReceipt extends MailMessage<TabReceiptOptions> {
  public constructor(options: TabReceiptOptions) {
    super(options, mailContents);
  }
}
