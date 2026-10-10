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
 * An `organ` is a shared account for a committee, fraternity or board. It is not a separate
 * entity: an organ is a {@link users!User | User} with `type` {@link users!UserType.ORGAN | ORGAN}.
 * It owns products, containers and points of sale, and it receives the revenue when its
 * products are sold.
 *
 * ### Membership
 * An {@link OrganMembership} row links a member user (`userId`) to an organ account
 * (`organId`). The pair is the primary key, so a user is a member of an organ at most once.
 *
 * Memberships are not edited through the API. The LDAP sync reads the members of each
 * shared group in Active Directory and calls
 * {@link internal/services!AuthenticationService.setMemberAuthenticator | setMemberAuthenticator},
 * which replaces the full member list of that organ.
 *
 * ### The `index` column
 * Each member has a small integer `index` within the organ, starting at 0. The database does
 * not enforce uniqueness; `setMemberAuthenticator` does. When the member list is replaced,
 * members who stay keep their index and new members get the lowest free one.
 * `GET /pointsofsale/{id}/associates` returns the owner's members with their index, so the
 * point of sale can show organ members in a stable order.
 *
 * ### Effect on permissions
 * Membership gives a user rights over the organ's resources in two ways:
 * - `RoleManager.getRoles` adds the `Seller` role to any user who is a member of at least
 *   one organ. See {@link rbac}.
 * - `RoleManager.getUserOrgans` puts the user's organs in the `organs` claim of their JWT.
 *   Controllers check that claim with `userTokenInOrgan()` to return the `organ` relation
 *   for a resource owned by one of those organs. `UserService.areInSameOrgan()` does the
 *   same check against the database for two arbitrary users.
 *
 * `GET /users/{id}/members` lists the members of an organ.
 *
 * @module organ
 * @mergeTarget
 */

import {
  Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryColumn,
} from 'typeorm';
import User from '../user/user';
import BaseEntityWithoutId from '../base-entity-without-id';

/**
 * The OrganMembership entity tracks user membership in organs (shared accounts).
 * 
 * **Purpose:**
 * - Tracks which users are members of organs (UserType.ORGAN)
 * - Used for RBAC permission checks (determining 'organ' vs 'own' vs 'all' relations)
 * - Populates the JWT token's `organs` field
 * - Powers `userTokenInOrgan()` helper and `areInSameOrgan()` checks
 * 
 * @typedef {BaseEntityWithoutId} OrganMembership
 * @property {User.model} user.required - The user who is a member of the organ
 * @property {User.model} organ.required - The organ (shared account) that the user is a member of
 * 
 * @promote
 */
@Entity()
export default class OrganMembership extends BaseEntityWithoutId {
  @PrimaryColumn()
  public userId: number;

  @OneToOne(() => User, { nullable: false, eager: true })
  @JoinColumn({ name: 'userId' })
  public user: User;

  @PrimaryColumn()
  public organId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'organId' })
  public organ: User;

  @Column({ nullable: false })
  public index: number;
}
