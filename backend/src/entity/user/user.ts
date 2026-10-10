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
 * A `User` is any account that can hold a {@link balance!Balance | Balance} in SudoSOS.
 * People, organs, voucher cards, invoice accounts and points of sale are all `User` rows.
 * The `type` column says which kind of account it is.
 *
 * ### User types
 * {@link UserType} decides which default roles an account gets. `POST /users` accepts every
 * type, so an admin can create any of them by hand. The other creation paths are:
 * - `MEMBER` -- a GEWIS member. Created on first login through `POST /authentication/gewisweb`
 *   (`Gewis.createUserFromWeb`) or `POST /authentication/GEWIS/LDAP`
 *   (`Gewis.findOrCreateGEWISUserAndBind`), and by the LDAP sync for role and group members
 *   it does not know yet. These paths also create a {@link MemberUser} that stores the member
 *   number. `POST /authentication/LDAP` (`AuthenticationService.createUserAndBind`) and the
 *   LDAP sync for AD users without a member number create a `MEMBER` without a `MemberUser`.
 *   Members are kept in sync by the GEWISDB and LDAP sync services.
 * - `LOCAL_USER` and `LOCAL_ADMIN` -- accounts managed inside SudoSOS, for externals and
 *   administrators. These are the types meant to have a password ({@link LocalUserTypes}):
 *   only they get an `expiryDate` and a welcome mail with a reset link from
 *   `UserService.createUser`. This is not enforced. `PUT /users/{id}/authenticator/local`
 *   sets a password for any type, and `POST /authentication/local` accepts it. A reset mail
 *   can be requested with `POST /authentication/local/reset`, but only for `LOCAL_USER`.
 *   Their `expiryDate` is enforced by the daily expiry cron.
 * - `ORGAN` -- a shared account for a committee, fraternity or board. The LDAP sync creates
 *   one for each shared group (`ADService.toSharedUser`). Members act on its behalf through
 *   {@link organ!OrganMembership | OrganMembership}.
 * - `VOUCHER` -- a pre-paid card created by a {@link vouchers!VoucherGroup | VoucherGroup}.
 * - `INVOICE` -- an account that pays by invoice, with address defaults in
 *   {@link invoicing!InvoiceUser | InvoiceUser}.
 * - `POINT_OF_SALE` -- the dedicated user a point of sale authenticates as. Created together
 *   with the {@link catalogue/point-of-sale!PointOfSale | PointOfSale}. `UserService` hides
 *   these users from user lists.
 * - `INTEGRATION` -- a service account for an external system. The LDAP sync creates one for
 *   each AD service account (`ADService.toServiceAccount`).
 *
 * `PATCH /users/{id}/usertype` can only switch between `MEMBER` and `LOCAL_USER`. A
 * `LOCAL_USER` who logs in through GEWIS web is converted back to `MEMBER` automatically.
 *
 * ### Authentication
 * A user logs in through one or more authenticators, each stored in its own entity in the
 * {@link authentication} module: LDAP, a local password, a PIN, an NFC card, an EAN
 * barcode, an API key, or a QR code scanned with a phone. They are managed in different
 * places:
 * - PIN, NFC, API key and local password: `/users/{id}/authenticator/pin`, `/nfc`, `/key`
 *   and `/local` on `UserController`.
 * - LDAP: bound on first LDAP login or by the LDAP sync, and removed by the sync.
 * - EAN: only used to log in (`POST /authentication/ean`). No endpoint creates one.
 * - QR: a short-lived login session from `POST /authentication/qr/generate`, confirmed by
 *   the user with `POST /authentication/qr/{sessionId}/confirm`.
 *
 * Local passwords live in {@link authentication!LocalAuthenticator | LocalAuthenticator}.
 * The {@link users!LocalUser | LocalUser} entity also has a `passwordHash` column, but it is
 * a legacy table. It is registered in `database.ts` and no code reads or writes it.
 *
 * ### Roles
 * A user's permissions are the union of three sources, resolved by `RoleManager.getRoles`:
 * roles mapped from `type` via {@link rbac!RoleUserType | RoleUserType}, roles assigned
 * directly via {@link rbac!AssignedRole | AssignedRole} (`POST /users/{id}/roles`), and
 * the `Seller` role when the user is a member of at least one organ. See {@link rbac}.
 *
 * ### Balance
 * A user's balance is derived from the {@link transactions!Transaction | Transactions} and
 * {@link transfers!Transfer | Transfers} that name them. Buying debits the buyer and
 * credits the container owner. `canGoIntoDebt` controls whether a purchase may take the
 * balance below zero.
 *
 * ### Closing an account
 * Rows are never removed, so past transactions keep a valid buyer. There are two ways to
 * close an account:
 * - `DELETE /users/{id}` soft-deletes the user by setting `deleted`. It does not check the
 *   balance and leaves `active` and `canGoIntoDebt` as they are.
 * - `UserService.closeUser` clears `active` and `canGoIntoDebt`, and optionally sets
 *   `deleted`. It refuses to delete a user whose balance is not zero. The GEWISDB sync and
 *   write-offs use this path.
 *
 * ### Terms of service
 * When a user is created, `tosRequired` is set if their type is in {@link TOSRequired}.
 * Until such a user accepts the current terms of service, `RestrictionMiddleware` answers
 * most endpoints with `403`. Each acceptance is stored as a
 * {@link terms-of-service!TermsOfServiceAcceptance | TermsOfServiceAcceptance}
 * (`POST /users/acceptTos`).
 *
 * For API interactions, refer to the [Swagger Documentation](https://sudosos.gewis.nl/api/api-docs/#/users).
 *
 * @module users
 * @mergeTarget
 */

import {
  Column, Entity, JoinColumn, OneToMany, OneToOne,
} from 'typeorm';
import BaseEntity from '../base-entity';
import UserFineGroup from '../fine/userFineGroup';
import AssignedRole from '../rbac/assigned-role';
import PointOfSale from '../point-of-sale/point-of-sale';
import MemberUser from './member-user';

export enum TermsOfServiceStatus {
  ACCEPTED = 'ACCEPTED',
  NOT_ACCEPTED = 'NOT_ACCEPTED',
  NOT_REQUIRED = 'NOT_REQUIRED',
}

export enum UserType {
  MEMBER = 'MEMBER',
  ORGAN = 'ORGAN',
  VOUCHER = 'VOUCHER',
  LOCAL_USER = 'LOCAL_USER',
  LOCAL_ADMIN = 'LOCAL_ADMIN',
  INVOICE = 'INVOICE',
  POINT_OF_SALE = 'POINT_OF_SALE',
  INTEGRATION = 'INTEGRATION',
}

/**
 * All user types that should be allowed to have a local password.
 */
export const LocalUserTypes = [
  UserType.LOCAL_USER, UserType.LOCAL_ADMIN,
];

/**
 * All users that have required TOS restrictions.
 */
export const TOSRequired = [
  UserType.MEMBER, UserType.LOCAL_USER, UserType.LOCAL_ADMIN,
];

/**
 * All users that should be notified when in debt.
 */
export const NotifyDebtUserTypes: UserType[] = [
  UserType.LOCAL_ADMIN, UserType.LOCAL_USER, UserType.MEMBER,
];

/**
 * All users that have made inactive administrative costs.
 */
export const EligibleInactiveUsers: UserType[] = [
  UserType.LOCAL_USER, UserType.MEMBER,
];

/**
 * **Inactive** (`active: false`): the user can only log in and top up their balance.
 * Intended for e.g. alumni who have graduated but still have an outstanding debt.
 *
 * **Soft-deleted** (`deleted: true`): the account is archived but the database record
 * is preserved for transaction history. `DELETE /users/{id}` does not check the balance.
 * `UserService.closeUser` only soft-deletes a user whose balance is exactly €0.00.
 *
 * @typedef {BaseEntity} User
 * @property {string} firstName.required - First name of the user.
 * @property {string} lastName - Last name of the user.
 * @property {string} nickname - Nickname of the user.
 * @property {boolean} active - Whether the user is active. Defaults to false.
 * @property {boolean} canGoIntoDebt - Whether the user can have a negative balance. Defaults to false
 * @property {boolean} ofAge - Whether the user is 18+ or not.
 * @property {string} email - The email of the user.
 * @property {boolean} deleted - Whether the user was soft-deleted. Defaults to false.
 * @property {string} type.required - The type of user.
 * @property {boolean} productSelfService - Whether organ members can manage this organ's
 *    products and containers without BAC/GEWIS PM. Only meaningful for organ users. Defaults to false.
 */
@Entity()
export default class User extends BaseEntity {
  @Column({
    length: 64,
  })
  public firstName: string;

  @Column({
    length: 64,
    default: '',
  })
  public lastName: string;

  @Column({
    length: 64,
    nullable: true,
  })
  public nickname: string;

  /**
   * Whether this user is active. Inactive users (`active: false`) can only log in
   * and top up their balance — e.g. alumni who still have an outstanding debt.
   */
  @Column({
    default: false,
  })
  public active: boolean;

  /**
   * Whether this user can have a negative balance
   */
  @Column({
    default: false,
  })
  public canGoIntoDebt: boolean;

  @Column({
    default: false,
  })
  public ofAge: boolean;

  @Column({
    length: 64,
    default: '',
  })
  public email: string;

  /**
   * Whether this user has been soft-deleted. The record is preserved to maintain
   * transaction history integrity. `DELETE /users/{id}` sets this without a balance check;
   * `UserService.closeUser` only sets it when the balance is exactly €0.00.
   */
  @Column({
    default: false,
  })
  public deleted: boolean;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  public type: UserType;

  @Column({
    default: true,
  })
  public tosRequired: boolean;

  @Column({
    default: false,
  })
  public extensiveDataProcessing: boolean;

  @Column({
    default: false,
  })
  public inactiveNotificationSend: boolean;

  @Column({
    type: 'datetime',
    nullable: true,
  })
  public lastSeen: Date | null;

  /**
   * Date at which this account is scheduled to expire. When the date is in the past,
   * the daily expiry CRON deactivates the user. Only set for local user types
   * (see {@link LocalUserTypes}); `null` for all other user types.
   */
  @Column({
    type: 'datetime',
    nullable: true,
  })
  public expiryDate: Date | null;

  /**
   * Whether the near-expiration warning email has already been sent to this user.
   * Set to `true` after the daily notification CRON sends the 30-day warning so
   * that the user is not re-notified each day during the warning window. Reset
   * to `false` when `expiryDate` is changed via PATCH.
   */
  @Column({
    default: false,
  })
  public expiryNotificationSent: boolean;

  /**
   * Whether members of this organ can manage its own products and containers
   * (create/update/delete) without going through BAC/GEWIS PM. Only meaningful
   * for {@link UserType.ORGAN}; ignored for all other user types.
   */
  @Column({
    default: false,
  })
  public productSelfService: boolean;

  @OneToOne(() => UserFineGroup, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  public currentFines?: UserFineGroup | null;

  @OneToMany(() => AssignedRole, (role) => role.user)
  public directAssignedRoles: AssignedRole[];

  @OneToOne(() => PointOfSale, (pos) => pos.user)
  public pointOfSale?: PointOfSale;

  @OneToOne(() => MemberUser, (memberUser) => memberUser.user)
  public memberUser?: MemberUser;

  public fullName(): string {
    return User.fullName(this);
  }

  /**
   * Get the full name of the given user.
   * Separate static method, as user objects taken from tokens
   * do not have any class methods.
   * @param user
   */
  public static fullName(user: User): string {
    let name = user.firstName;
    if (user.nickname) name += ` "${user.nickname}"`;
    if (user.lastName) name += ` ${user.lastName}`;
    return name;
  }

  public toString(): string {
    return `${this.fullName()} (SudoSOS ID: ${this.id})`;
  }
}
