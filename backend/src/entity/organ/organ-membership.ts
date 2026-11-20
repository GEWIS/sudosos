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
 * An organ is a shared account for a committee, fraternity or board: a {@link users!User | User}
 * with type {@link users!UserType.ORGAN | ORGAN}. It owns products, containers and points of sale,
 * and receives their revenue.
 *
 * ### Membership
 * An {@link OrganMembership} links a user (`userId`) to an organ (`organId`). The LDAP sync sets
 * the members of each organ with
 * {@link internal/services!AuthenticationService.setMemberAuthenticator | setMemberAuthenticator}.
 * No endpoint edits memberships.
 *
 * Each member has an `index` within the organ. Existing members keep theirs; new members get the
 * lowest free one. `GET /pointsofsale/{id}/associates` uses it to list members in a stable order.
 *
 * ### Permissions
 * - Members of any organ get the `Seller` role. See {@link rbac}.
 * - A user's organs are stored in the `organs` claim of their JWT. `userTokenInOrgan()` checks
 *   whether the token's user is a member of a given organ, which gives the `organ` relation on
 *   that organ's resources. For products and containers, the organ must also have
 *   `productSelfService` enabled.
 * - `UserService.areInSameOrgan()` checks whether two users share at least one organ.
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
