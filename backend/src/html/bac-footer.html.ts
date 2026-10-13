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
 * BAC letterhead footer shared by every HTML PDF: BAC name + visiting
 * address | VAT + KvK | IBAN | contact. The look (font, padding, grid) lives
 * here so both layouts render it identically; each layout only decides where
 * the footer sits, and adds the `bac-foot` class to its container.
 */

import { BAC } from '../files/templates/bac-letterhead';
import { escapeHtml } from './escape';

/* Footer column proportions: BAC name+address | VAT+KvK | IBAN | contact.
   All four columns lead with a header line; the BTW/IBAN columns use an
   invisible <strong> spacer so their data rows align with the address /
   email rows in the bold-labelled columns. */
export const BAC_FOOTER_CSS = `
  .bac-foot { font:8.5pt/1.5 "Helvetica Neue", Arial, sans-serif; color:#6B6B6B; padding:24px 56px 30px; display:grid; grid-template-columns:1.3fr 1.2fr 1.6fr 1.1fr; gap:24px }
  .bac-foot .col { white-space:nowrap }
  .bac-foot .col strong { display:block; color:#111; font-size:9pt; margin-bottom:4px; font-weight:700; white-space:normal }`;

/**
 * Render the four footer columns. Wrap the result in an element with the
 * `bac-foot` class and include `BAC_FOOTER_CSS` in the page styles.
 */
export function bacFooterHtml(): string {
  return `
      <div class="col">
        <strong>${escapeHtml(BAC.name)}</strong>
        ${escapeHtml(BAC.street)}<br>
        ${escapeHtml(BAC.postalCity)}
      </div>
      <div class="col">
        <strong style="visibility:hidden">&nbsp;</strong>
        VAT ${escapeHtml(BAC.vat)}<br>
        KvK ${escapeHtml(BAC.kvk)}
      </div>
      <div class="col">
        <strong style="visibility:hidden">&nbsp;</strong>
        IBAN ${escapeHtml(BAC.iban)}
      </div>
      <div class="col">
        <strong>contact</strong>
        ${escapeHtml(BAC.email)}<br>
        ${escapeHtml(BAC.phone)}
      </div>`;
}
