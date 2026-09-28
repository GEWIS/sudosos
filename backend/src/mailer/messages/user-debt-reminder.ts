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
 * This is the module page of the user-debt-reminder.
 *
 * @module internal/mailer
 */

import MailContentBuilder from './mail-content-builder';
import MailMessage, { Language, MailLanguageMap } from '../mail-message';
import { UserDebtReminderOptions } from '../../notifications';

const userDebtReminderDutch = new MailContentBuilder<UserDebtReminderOptions>({
  getHTML: (context) => `
<p>Volgens onze administratie heb je momenteel een negatief saldo bij SudoSOS van
<span style="color: red; font-weight: bold">${context.balance.toFormat()}</span>.</p>

<p>Ga naar de SudoSOS website om je saldo op te hogen.</p>`,
  getSubject: 'Je SudoSOS saldo is negatief',
  getTitle: 'Negatief saldo',
  getText: (context) => `
Volgens onze administratie heb je momenteel een negatief saldo bij SudoSOS van ${context.balance.toFormat()}.

Ga naar de SudoSOS website om je saldo op te hogen.

Tot op de borrel!`,
});

const userDebtReminderEnglish = new MailContentBuilder<UserDebtReminderOptions>({
  getHTML: (context) => `
<p>According to our administration, you currently have a negative SudoSOS balance of
<span style="color: red; font-weight: bold">${context.balance.toFormat()}</span>.</p>

<p>Go to the SudoSOS website to top up your balance.</p>`,
  getSubject: 'Your SudoSOS balance is negative',
  getTitle: 'Negative balance',
  getText: (context) => `
According to our administration, you currently have a negative SudoSOS balance of ${context.balance.toFormat()}.

Go to the SudoSOS website to top up your balance.

See you at the borrel!`,
});

const mailContents: MailLanguageMap<UserDebtReminderOptions> = {
  [Language.DUTCH]: userDebtReminderDutch,
  [Language.ENGLISH]: userDebtReminderEnglish,
};

/**
 * Reminds a user that their balance is negative. Unlike `UserDebtNotification`, this
 * email does not mention fines, so it can be sent in periods when no fines are handed out.
 */
export default class UserDebtReminder extends MailMessage<UserDebtReminderOptions> {
  public constructor(options: UserDebtReminderOptions) {
    const opt: UserDebtReminderOptions = { ...options };
    if (!options.url) {
      opt.url = process.env.url;
    }
    super(opt, mailContents);
  }
}
