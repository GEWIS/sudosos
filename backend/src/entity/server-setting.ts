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
 * A `ServerSetting` is a key-value pair of runtime configuration for the whole SudoSOS instance.
 * Secrets and connection details stay in environment variables.
 *
 * ### Keys
 * {@link ISettings} lists the keys. Defaults are in `src/server-settings/setting-defaults.ts`.
 * - `highVatGroupId`: the {@link catalogue/vat!VatGroup | VatGroup} set on write-off transfers.
 * - `administrativeCostValue`: the administrative cost for inactive users, in cents.
 * - `jwtExpiryDefault`: lifetime of a login token, in seconds.
 * - `jwtExpiryPointOfSale`: lifetime of a point-of-sale token, in seconds.
 * - `maintenanceMode`: when `true`, most endpoints answer `503`.
 * - `allowGewisSyncDelete`: whether the GEWISDB sync may close the accounts of former members.
 * - `strictPosToken`: how strictly `POSTokenVerifier` checks point-of-sale tokens.
 * - `wrappedEnabled`: whether the frontends show {@link entity/wrapped | Wrapped}.
 *
 * ### Reading and writing
 * {@link ServerSettingsStore} loads all settings at startup and inserts missing defaults. Values
 * are stored as JSON. `maintenanceMode` and `wrappedEnabled` are read from the database on each
 * request. Other keys need a restart after a direct database change.
 *
 * Only `maintenanceMode` and `wrappedEnabled` can be changed through the API.
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
