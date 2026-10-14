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
 * A `UserSetting` is one preference of one {@link users!User | User}, stored as a
 * key-value pair. The frontends read and write these settings; the backend only stores
 * them.
 *
 * ### Keys
 * {@link IUserSettings} lists every key and its type. The default values live in
 * `src/user-settings/user-settings-defaults.ts`.
 * - `betaEnabled` -- whether the user opted in to beta features of the dashboard.
 *   Defaults to `false`.
 * - `dashboardTheme` -- the organ whose theme the dashboard shows, as a
 *   {@link DashboardTheme}. Defaults to `null`, the standard theme.
 * - `language` -- the preferred interface language, one of {@link SUPPORTED_LANGUAGES}.
 *   Defaults to `undefined`, so the frontend picks one.
 *
 * ### Storage
 * There is one row per user and key; the pair `[userId, key]` is unique and indexed. The
 * value is stored as JSON in a text column. The foreign key to the user has
 * `onDelete: 'CASCADE'`, but users are only soft-deleted, so the rows of a deleted user stay.
 * `GET /users/{id}/settings` still returns them.
 *
 * A user only has rows for settings they changed. {@link UserSettingsStore} fills in the
 * default for every key without a row, or whose value is `null`.
 *
 * ### Reading and writing
 * `GET /users/{id}/settings` returns all settings with defaults filled in.
 * `PATCH /users/{id}/settings` updates the given keys and ignores keys whose value is
 * `undefined`. Both endpoints need the `get` or `update` permission on the `settings`
 * attribute of `User`, so users can manage their own settings.
 *
 * For API interactions, refer to the [Swagger Documentation](https://sudosos.gewis.nl/api/api-docs/#/users).
 *
 * @module internal/user-settings
 * @mergeTarget
 */

import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import BaseEntity from './base-entity';
import User from './user/user';

export interface DashboardTheme {
  organId: number;
  organName: string;
}

export const SUPPORTED_LANGUAGES = ['nl-NL', 'en-US', 'pl-PL'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface IUserSettings {
  betaEnabled: boolean;
  dashboardTheme: DashboardTheme | null;
  language: SupportedLanguage | undefined;
}

/**
 * Key-value store for user-specific settings
 */
@Entity()
@Unique(['userId', 'key'])
@Index(['userId', 'key'])
export default class UserSetting<T extends keyof IUserSettings = keyof IUserSettings> extends BaseEntity {
  @Column({
    type: 'integer',
    nullable: false,
  })
  public userId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: false,
  })
  public key: T;

  /**
   * JSON-stored value
   */
  @Column({
    type: 'text',
    nullable: true,
    transformer: {
      from(value: string | null): IUserSettings[T] | null {
        if (value == null) return null;
        return JSON.parse(value);
      },
      to(value: IUserSettings[T] | null | undefined): string | null {
        if (value == null) return null;
        return JSON.stringify(value);
      },
    },
  })
  public value: IUserSettings[T];
}
