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
import { UserGotInactiveAdministrativeCostOptions } from '../../notifications/notification-options';


/**
 * This is the module page of the user-got-inactive-administrative-cost.
 *
 * @module internal/mailer
 */

const formatBalance = (b: Dinero) => {
  return `<span style="font-weight: bold;">${b.toFormat()}</span>`;
};

// If the deduction emptied the balance, the opening refers to the money in the past tense
// and the closing line about avoiding further costs is left out.
const hasMoneyLeft = (context: UserGotInactiveAdministrativeCostOptions) => context.currentUserBalance.getAmount() > 0;

const userGotInactiveAdministrativeCostDutch = new MailContentBuilder<UserGotInactiveAdministrativeCostOptions>({
  getHTML: (context) => `
  <p>${hasMoneyLeft(context) ? 'Je hebt nog geld op je SudoSOS-account staan.' : 'Je had nog geld op je SudoSOS-account staan.'}</p>

  <p>Je hebt de afgelopen 3 jaar geen transacties of opwaarderingen gedaan binnen SudoSOS. Daarom zijn er administratiekosten in rekening gebracht.</p>

  <p>Er is ${formatBalance(context.amount)} aan administratiekosten van je SudoSOS-saldo afgeschreven. Je saldo is nu ${formatBalance(context.currentUserBalance)}.</p>

  ${hasMoneyLeft(context) ? '<p>Wil je verdere administratiekosten voorkomen? Doe dan een transactie of waardeer je saldo op in SudoSOS.</p>' : ''}
  `,
  getSubject: () => 'Administratiekosten SudoSOS afgeschreven',
  getTitle: 'Administratiekosten afgeschreven',
  getText: (context) => `
  ${hasMoneyLeft(context) ? 'Je hebt nog geld op je SudoSOS-account staan.' : 'Je had nog geld op je SudoSOS-account staan.'}

  Je hebt de afgelopen 3 jaar geen transacties of opwaarderingen gedaan binnen SudoSOS. Daarom zijn er administratiekosten in rekening gebracht.

  Er is ${context.amount.toFormat()} aan administratiekosten van je SudoSOS-saldo afgeschreven. Je saldo is nu ${context.currentUserBalance.toFormat()}.

  ${hasMoneyLeft(context) ? 'Wil je verdere administratiekosten voorkomen? Doe dan een transactie of waardeer je saldo op in SudoSOS.' : ''}
  `,
});

const userGotInactiveAdministrativeCostEnglish = new MailContentBuilder<UserGotInactiveAdministrativeCostOptions>({
  getHTML: (context) => `
  <p>${hasMoneyLeft(context) ? 'You still have money left in your SudoSOS account.' : 'You still had money in your SudoSOS account.'}</p>

  <p>You have not made any transactions or top-ups in SudoSOS in the past 3 years. As a result, administrative costs have been charged.</p>

  <p>${formatBalance(context.amount)} in administrative costs has been deducted from your SudoSOS balance. Your balance is now ${formatBalance(context.currentUserBalance)}.</p>

  ${hasMoneyLeft(context) ? '<p>Want to avoid further administrative costs? Make a transaction or top up your balance in SudoSOS.</p>' : ''}
  `,
  getSubject: () => 'Administrative costs deducted SudoSOS',
  getTitle: 'Administrative costs deducted',
  getText: (context) => `
  ${hasMoneyLeft(context) ? 'You still have money left in your SudoSOS account.' : 'You still had money in your SudoSOS account.'}

  You have not made any transactions or top-ups in SudoSOS in the past 3 years. As a result, administrative costs have been charged.

  ${context.amount.toFormat()} in administrative costs has been deducted from your SudoSOS balance. Your balance is now ${context.currentUserBalance.toFormat()}.

  ${hasMoneyLeft(context) ? 'Want to avoid further administrative costs? Make a transaction or top up your balance in SudoSOS.' : ''}
  `,
});

const mailContents: MailLanguageMap<UserGotInactiveAdministrativeCostOptions> = {
  [Language.DUTCH]: userGotInactiveAdministrativeCostDutch,
  [Language.ENGLISH]: userGotInactiveAdministrativeCostEnglish,
};

export default class UserGotInactiveAdministrativeCost extends MailMessage<UserGotInactiveAdministrativeCostOptions> {
  public constructor(options: UserGotInactiveAdministrativeCostOptions) {
    super(options, mailContents);
  }
}