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
 * This is the module page of the password-reset-link.
 *
 * @module internal/mailer
 */

/**
 * Builds the dashboard link where a user sets a new password.
 * Query values are url-encoded, so addresses like `a+b@example.com` survive.
 * @param baseUrl - The frontend base URL
 * @param email - The email of the user
 * @param token - The reset token passcode, if the link should carry one
 */
export default function passwordResetLink(baseUrl: string, email: string, token?: string): string {
  const params = new URLSearchParams({ email });
  if (token) params.set('token', token);
  return `${baseUrl}/passwordreset?${params.toString()}`;
}
