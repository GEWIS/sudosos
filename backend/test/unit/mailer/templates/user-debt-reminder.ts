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

import { expect } from 'chai';
import dinero from 'dinero.js';
import UserDebtReminder from '../../../../src/mailer/messages/user-debt-reminder';
import { Language } from '../../../../src/mailer/mail-message';
import { UserDebtReminderOptions } from '../../../../src/notifications/notification-options';
import User from '../../../../src/entity/user/user';

describe('UserDebtReminderTemplate', () => {
  const user = { firstName: 'Samuel', email: 'samuel@example.test' } as User;
  const balance = dinero({ amount: -150 });
  const opts = new UserDebtReminderOptions('', balance);

  it('includes the balance in English without mentioning fines', () => {
    const options = new UserDebtReminder(opts).getOptions(user, Language.ENGLISH);
    expect(options.subject).to.include('negative');
    expect(options.html).to.include(balance.toFormat());
    expect(options.text).to.include(balance.toFormat());
    expect(String(options.html).toLowerCase()).to.not.include('fine');
    expect(String(options.text).toLowerCase()).to.not.include('fine');
  });

  it('includes the balance in Dutch without mentioning fines', () => {
    const options = new UserDebtReminder(opts).getOptions(user, Language.DUTCH);
    expect(options.subject).to.include('negatief');
    expect(options.html).to.include(balance.toFormat());
    expect(options.text).to.include(balance.toFormat());
    expect(String(options.html).toLowerCase()).to.not.include('boete');
    expect(String(options.text).toLowerCase()).to.not.include('boete');
  });

  it('throws for an unknown language', () => {
    const tpl = new UserDebtReminder(opts);
    expect(() => tpl.getOptions(user, 'jp-JP' as any)).to.throw('Unknown language');
  });
});
