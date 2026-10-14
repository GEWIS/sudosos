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
 * A `ServerSetting` is one key-value pair of runtime configuration that applies to the
 * whole SudoSOS instance. Environment variables hold secrets and connection details;
 * server settings hold the behaviour that administrators may want to change without a
 * redeploy.
 *
 * ### Keys
 * {@link ISettings} lists every key and its type. The default values live in
 * `src/server-settings/setting-defaults.ts`.
 * - `highVatGroupId` -- the {@link catalogue/vat!VatGroup | VatGroup} used on the transfers
 *   of write-offs and inactive administrative costs. Defaults to `-1` (not set).
 * - `administrativeCostValue` -- the administrative cost charged to inactive users, in
 *   cents. Defaults to `1000`.
 * - `jwtExpiryDefault` -- lifetime of a normal login token, in seconds. Defaults to one hour.
 * - `jwtExpiryPointOfSale` -- lifetime of a point-of-sale token, in seconds. Defaults to
 *   14 days.
 * - `maintenanceMode` -- when `true`, `RestrictionMiddleware` answers `503` to every
 *   endpoint not marked as available during maintenance, unless the token may override it.
 * - `allowGewisSyncDelete` -- whether the GEWISDB sync may close member accounts.
 *   `GewisDBSyncService.sync` fails a member who is missing from GEWISDB, whose membership
 *   `expiration` has passed, or who is marked `deleted` there. When no sync service accepts
 *   the member, `down()` calls `UserService.closeUser`. That clears `active` and
 *   `canGoIntoDebt`, and also soft-deletes the account if its balance is zero. With this
 *   setting on, every expired member is therefore closed as well.
 * - `strictPosToken` -- meant to control `POSTokenVerifier`. A token issued for one point of
 *   sale is always rejected on another. When `true`, tokens that were not issued for any
 *   point of sale should be rejected as well. This currently has no effect.
 *   `POST /transactions` and `POST /transactions/validate` only call the verifier when the
 *   token has a `posId`, so a token without one is always accepted.
 * - `wrappedEnabled` -- whether the frontends show {@link entity/wrapped | Wrapped}.
 *
 * ### Storage
 * Each key is one row with a unique `key` column. The value is stored as JSON in a text
 * column and parsed by a TypeORM transformer, so any JSON value fits.
 *
 * ### Reading and writing
 * {@link ServerSettingsStore} is a singleton that loads all rows at startup. It inserts the
 * default value for any key that has no row yet. `getSetting` reads from that in-memory
 * copy; `getSettingFromDatabase` reads the row and refreshes the copy. `maintenanceMode`
 * and `wrappedEnabled` are read from the database on each request, so they take effect
 * immediately. The other keys are read from memory, so a change made directly in the
 * database needs a restart.
 *
 * Only two keys can be changed through the API:
 * - `PUT /server-settings/maintenance-mode` needs the `update` permission on `Maintenance`.
 * - `PUT /server-settings/wrapped-enabled` needs the `update` permission on `ServerSettings`.
 *   `GET /server-settings/wrapped-enabled` is open to any logged-in user.
 *
 * For API interactions, refer to the [Swagger Documentation](https://sudosos.gewis.nl/api/api-docs/#/serverSettings).
 *
 * @module internal/server-settings
 * @mergeTarget
 */

import { Column, Entity } from 'typeorm';
import BaseEntity from './base-entity';

export interface ISettings {
  highVatGroupId: number;
  administrativeCostValue: number;
  jwtExpiryDefault: number;
  jwtExpiryPointOfSale: number;
  maintenanceMode: boolean;
  allowGewisSyncDelete: boolean;
  strictPosToken: boolean;
  wrappedEnabled: boolean;
}

/**
 * Key-value store
 */
@Entity()
export default class ServerSetting<T extends keyof ISettings = keyof ISettings> extends BaseEntity {
  @Column({ type: 'varchar', unique: true })
  public key: T;

  /**
   * JSON-stored value
   */
  @Column({
    type: 'text',
    transformer: {
      from(value: string | null): number[] | null {
        if (value == null) return null;
        return JSON.parse(value);
      },
      to(value: number[] | null): string | null {
        if (value == null) return null;
        return JSON.stringify(value);
      },
    },
  })
  public value: ISettings[T];
}
