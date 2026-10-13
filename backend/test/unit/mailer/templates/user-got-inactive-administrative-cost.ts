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
import UserGotInactiveAdministrativeCost from '../../../../src/mailer/messages/user-got-inactive-administrative-cost';
import { Language } from '../../../../src/mailer/mail-message';
import { UserGotInactiveAdministrativeCostOptions } from '../../../../src/notifications/notification-options';
import User from '../../../../src/entity/user/user';

describe('UserGotInactiveAdministrativeCostTemplate', () => {
  const user = { firstName: 'Samuel', email: 'samuel@example.test' } as User;
  const moneyLeftOpts = new UserGotInactiveAdministrativeCostOptions(dinero({ amount: 1000 }), dinero({ amount: 1500 }));
  // The balance was lower than the cost, so everything was deducted.
  const emptyOpts = new UserGotInactiveAdministrativeCostOptions(dinero({ amount: 500 }), dinero({ amount: 0 }));

  const build = (opts: UserGotInactiveAdministrativeCostOptions, language: Language) => {
    const { html, text } = new UserGotInactiveAdministrativeCost(opts).getOptions(user, language);
    return [html as string, text as string];
  };

  describe('English', () => {
    it('opens with the remaining money and tells how to avoid further costs when money is left', () => {
      for (const body of build(moneyLeftOpts, Language.ENGLISH)) {
        expect(body).to.include('You still have money left in your SudoSOS account.');
        expect(body).to.include('Want to avoid further administrative costs?');
      }
    });

    it('uses the past tense and leaves out the closing line when no money is left', () => {
      for (const body of build(emptyOpts, Language.ENGLISH)) {
        expect(body).to.include('You still had money in your SudoSOS account.');
        expect(body).to.not.include('You still have money left');
        expect(body).to.not.include('Want to avoid further administrative costs?');
      }
    });
  });

  describe('Dutch', () => {
    it('opens with the remaining money and tells how to avoid further costs when money is left', () => {
      for (const body of build(moneyLeftOpts, Language.DUTCH)) {
        expect(body).to.include('Je hebt nog geld op je SudoSOS-account staan.');
        expect(body).to.include('Wil je verdere administratiekosten voorkomen?');
      }
    });

    it('uses the past tense and leaves out the closing line when no money is left', () => {
      for (const body of build(emptyOpts, Language.DUTCH)) {
        expect(body).to.include('Je had nog geld op je SudoSOS-account staan.');
        expect(body).to.not.include('Je hebt nog geld');
        expect(body).to.not.include('Wil je verdere administratiekosten voorkomen?');
      }
    });
  });

  it('never prints a raw boolean into the email', () => {
    for (const opts of [moneyLeftOpts, emptyOpts]) {
      for (const language of [Language.ENGLISH, Language.DUTCH]) {
        for (const body of build(opts, language)) {
          expect(body).to.not.match(/\b(true|false)\b/);
        }
      }
    }
  });
});
