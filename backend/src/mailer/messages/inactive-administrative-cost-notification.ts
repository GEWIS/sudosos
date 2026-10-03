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

import { Dinero } from 'dinero.js';
import MailContentBuilder from './mail-content-builder';
import MailMessage, { Language, MailLanguageMap } from '../mail-message';
import { InactiveAdministrativeCostNotificationOptions } from '../../notifications/notification-options';


/**
 * This is the module page of the inactive-administrative-cost-notification.
 *
 * @module internal/mailer
 */

const formatBalance = (b: Dinero) => {
  return `<span style="font-weight: bold;">${b.toFormat()}</span>`;
};

const inactiveAdministrativeCostNotificationDutch = new MailContentBuilder<InactiveAdministrativeCostNotificationOptions>({
  getHTML: (context) => `
  <p>Je hebt nog geld op je SudoSOS-account staan.</p>

  <p>Je hebt de afgelopen 2 jaar geen transacties of opwaarderingen gedaan binnen SudoSOS. Als je account nog een jaar inactief blijft, worden er administratiekosten in rekening gebracht.</p>

  <p>Er wordt dan ${formatBalance(context.administrativeCostValue)} aan administratiekosten van je SudoSOS-saldo afgeschreven. Je huidige saldo is ${formatBalance(context.currentUserBalance)}.</p>

  <p>Wil je dit voorkomen? Doe dan binnen een jaar een transactie of waardeer je saldo op in SudoSOS.</p>
  `,
  getSubject: () => 'Aankondiging administratiekosten SudoSOS',
  getTitle: 'Aankondiging administratiekosten',
  getText: (context) => `
  Je hebt nog geld op je SudoSOS-account staan.

  Je hebt de afgelopen 2 jaar geen transacties of opwaarderingen gedaan binnen SudoSOS. Als je account nog een jaar inactief blijft, worden er administratiekosten in rekening gebracht.

  Er wordt dan ${context.administrativeCostValue.toFormat()} aan administratiekosten van je SudoSOS-saldo afgeschreven. Je huidige saldo is ${context.currentUserBalance.toFormat()}.

  Wil je dit voorkomen? Doe dan binnen een jaar een transactie of waardeer je saldo op in SudoSOS.
  `,
});

const inactiveAdministrativeCostNotificationEnglish = new MailContentBuilder<InactiveAdministrativeCostNotificationOptions>({
  getHTML: (context) => `
  <p>You still have money left in your SudoSOS account.</p>

  <p>You have not made any transactions or top-ups in SudoSOS in the past 2 years. If your account remains inactive for another year, administrative costs will be charged.</p>

  <p>At that point, ${formatBalance(context.administrativeCostValue)} in administrative costs will be deducted from your SudoSOS balance. Your current balance is ${formatBalance(context.currentUserBalance)}.</p>

  <p>Want to avoid this? Make a transaction or top up your balance in SudoSOS within the next year.</p>
  `,
  getSubject: () => 'Upcoming administrative costs SudoSOS',
  getTitle: 'Upcoming administrative costs',
  getText: (context) => `
  You still have money left in your SudoSOS account.

  You have not made any transactions or top-ups in SudoSOS in the past 2 years. If your account remains inactive for another year, administrative costs will be charged.

  At that point, ${context.administrativeCostValue.toFormat()} in administrative costs will be deducted from your SudoSOS balance. Your current balance is ${context.currentUserBalance.toFormat()}.

  Want to avoid this? Make a transaction or top up your balance in SudoSOS within the next year.
  `,
});

const mailContents: MailLanguageMap<InactiveAdministrativeCostNotificationOptions> = {
  [Language.DUTCH]: inactiveAdministrativeCostNotificationDutch,
  [Language.ENGLISH]: inactiveAdministrativeCostNotificationEnglish,
};

export default class InactiveAdministrativeCostNotification extends MailMessage<InactiveAdministrativeCostNotificationOptions> {
  public constructor(options: InactiveAdministrativeCostNotificationOptions) {
    super(options, mailContents);
  }
}