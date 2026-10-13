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
 * This is the module page of the ldap-sync-service.
 *
 * @module internal/ldap-sync-service
 */

import User, { UserType } from '../../../entity/user/user';
import { Client } from 'ldapts';
import ADService from '../../ad-service';
import LDAPAuthenticator from '../../../entity/authenticator/ldap-authenticator';
import RoleManager from '../../../rbac/role-manager';
import { EntityManager } from 'typeorm';
import { getLDAPConnection, LDAPGroup, LDAPUser } from '../../../helpers/ad';
import RBACService from '../../rbac-service';
import log4js, { Logger } from 'log4js';
import { UserSyncService } from './user-sync-service';
import Config from '../../../config';

export default class LdapSyncService extends UserSyncService {

  // We only sync organs, members and integrations.
  targets = [UserType.ORGAN, UserType.MEMBER, UserType.INTEGRATION];

  // Is set in the `pre` function.
  private ldapClient: Client;

  private readonly adService: ADService;

  private readonly roleManager: RoleManager;

  private logger: Logger = log4js.getLogger('AdSyncService');

  constructor(roleManager: RoleManager, adService?: ADService, manager?: EntityManager) {
    // Sanity check, since we already have a ldapClient
    if (!Config.get().ldap.enabled) throw new Error('LDAP is not enabled');

    super(manager);
    this.configureLogger(this.logger);
    this.roleManager = roleManager;
    this.adService = adService ?? new ADService(this.manager);
  }

  async guard(user: User): Promise<boolean> {
    if (!await super.guard(user)) return false;

    // For members, we only sync if we have an LDAPAuthenticator
    if (user.type === UserType.MEMBER) {
      const ldapAuth = await this.manager.findOne(LDAPAuthenticator, { where: { user: { id: user.id } } });
      return !!ldapAuth;
    }

    return true;
  }

  /**
   * Sync user based on LDAPAuthenticator.
   * Only organs are actually updated.
   * @param user
   * @param isDryRun - Whether this is a dry run (no actual changes)
   */
  async sync(user: User, isDryRun: boolean = false): Promise<boolean> {
    const ldapAuth = await this.manager.findOne(LDAPAuthenticator, { where: { user: { id: user.id } } });
    if (!ldapAuth) return false;

    const ldapUser = await this.adService.getLDAPResponseFromGUID(this.ldapClient, ldapAuth.UUID);
    if (!ldapUser) return false;

    // For members, we fetch user info from the GEWISDB
    // Therefore we do not need to update the user
    // But we do return true to indicate that the user is "bound" to the LDAP
    if (user.type === UserType.MEMBER) return true;

    this.logger.trace('ldap_sync.update_user', { id: user.id });
    user.firstName = ldapUser.displayName;
    user.lastName = '';
    user.canGoIntoDebt = false;
    user.tosRequired = false;
    user.active = true;
    
    if (!isDryRun) {
      await this.manager.save(user);
    }

    return true;
  }

  /**
   * Removes the LDAPAuthenticator for the given user.
   * @param user
   * @param isDryRun - Whether this is a dry run (no actual changes)
   */
  async down(user: User, isDryRun: boolean = false): Promise<void> {
    this.logger.trace('ldap_sync.down', { id: user.id });
    const ldapAuth = await this.manager.findOne(LDAPAuthenticator, { where: { user: { id: user.id } } });
    if (ldapAuth && !isDryRun) {
      await this.manager.delete(LDAPAuthenticator, { userId: user.id });
    }

    // For members, we only remove the authenticator.
    if (user.type === UserType.MEMBER) return;

    // For organs and integrations, we set the user to deleted and inactive.
    // TODO: closing organ active with non-zero balance?
    user.deleted = true;
    user.active = false;
    
    if (!isDryRun) {
      await this.manager.save(user);
    }
  }


  /**
   * Fetches all shared accounts from AD and creates them in SudoSOS.
   * Also updates the membership of the shared accounts.
   * @private
   */
  private async fetchSharedAccounts(): Promise<void> {
    this.logger.debug('ldap_sync.fetch_shared_accounts');
    const sharedAccounts = await this.adService.getLDAPGroups<LDAPGroup>(
      this.ldapClient, Config.get().ldap.sharedAccountFilter);

    // If there are new shared accounts, we create them.
    const newSharedAccounts = (await this.adService.filterUnboundGUID(sharedAccounts)) as LDAPGroup[];
    this.logger.trace('ldap_sync.fetch_shared_accounts.found', { count: newSharedAccounts.length });
    for (const sharedAccount of newSharedAccounts) {
      await this.adService.toSharedUser(sharedAccount);
    }

    for (const sharedAccount of sharedAccounts) {
      await this.adService.updateSharedAccountMembership(this.ldapClient, sharedAccount);
    }
  }

  /**
   * Adds local users to roles based on AD membership.
   * Roles are matched using the CN of the AD group.
   *
   * If an AD user has a role but no account yet, the account is created.
   *
   * @private
   */
  private async fetchUserRoles(): Promise<void> {
    this.logger.debug('ldap_sync.fetch_roles');
    const roles = await this.adService.getLDAPGroups<LDAPGroup>(
      this.ldapClient, Config.get().ldap.roleFilter);
    if (!roles) {
      this.logger.warn('ldap_sync.fetch_roles.none_found');
      return;
    }

    const [dbRoles] = await RBACService.getRoles();
    const dbRoleNames = new Set(dbRoles.map((r) => r.name));

    const nonLocalRoles = roles.filter(ldapRole => !dbRoleNames.has(ldapRole.cn));
    nonLocalRoles.forEach(ldapRole => {
      this.logger.warn('ldap_sync.role_missing_locally', { role: ldapRole.cn });
    });

    const localRoles = roles.filter(ldapRole => dbRoleNames.has(ldapRole.cn));
    this.logger.trace('ldap_sync.fetch_roles.found', { count: localRoles.length });
    for (const ldapRole of localRoles) {
      this.logger.trace('ldap_sync.update_role', { role: ldapRole.cn });
      await this.adService.updateRoleMembership(this.ldapClient, ldapRole, this.roleManager);
    }
  }

  /**
   * Fetches all service accounts from LDAP and creates them locally.
   *
   * @private
   */
  private async fetchServiceAccounts(): Promise<void> {
    this.logger.debug('ldap_sync.fetch_service_accounts');
    const serviceAccounts = (await this.adService.getLDAPGroupMembers(
      this.ldapClient, Config.get().ldap.serviceAccountFilter)).searchEntries;

    const newServiceAccounts = await this.adService.filterUnboundGUID(serviceAccounts);
    this.logger.trace('ldap_sync.fetch_service_accounts.found', { count: newServiceAccounts.length });
    for (const serviceAccount of newServiceAccounts) {
      await this.adService.toServiceAccount(serviceAccount as LDAPUser);
    }
  }

  /**
   * LDAP fetch retrieves organs, service accounts, and user roles from AD.
   */
  async fetch(): Promise<void> {
    this.logger.trace('ldap_sync.fetch');
    const config = Config.get();

    if (!config.ldap.sharedAccountFilter) {
      this.logger.warn('ldap_sync.fetch_shared_accounts.skipped', { missing: 'LDAP_SHARED_ACCOUNT_FILTER' });
    } else {
      await this.fetchSharedAccounts();
    }

    if (!config.ldap.roleFilter) {
      this.logger.warn('ldap_sync.fetch_roles.skipped', { missing: 'LDAP_ROLE_FILTER' });
    } else {
      await this.fetchUserRoles();
    }

    if (!config.ldap.serviceAccountFilter) {
      this.logger.warn('ldap_sync.fetch_service_accounts.skipped', { missing: 'LDAP_SERVICE_ACCOUNT_FILTER' });
    } else {
      await this.fetchServiceAccounts();
    }
  }

  // TODO: dependency injection of Client instead?
  //    i.e. add a Client to the constructor
  //    this would require us to make a wrapper constructor to be able to bind the client on call
  async pre(): Promise<void> {
    this.ldapClient = await getLDAPConnection();
  }

  async post(): Promise<void> {
    await this.ldapClient.unbind();
  }
}
