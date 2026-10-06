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
 * This is the maintenance script for development setup.
 * It performs maintenance tasks that are normally handled by cron jobs.
 *
 * @module internal/maintenance
 */

import 'reflect-metadata';
import log4js, { Logger } from 'log4js';
import Database from './database/database';
import dinero, { Currency } from 'dinero.js';
import { DataSource } from 'typeorm';
import BalanceService from './service/balance-service';
import RoleManager from './rbac/role-manager';
import DefaultRoles from './rbac/default-roles';
import LdapSyncService from './service/sync/user/ldap-sync-service';
import { UserSyncService } from './service/sync/user/user-sync-service';
import UserSyncManager from './service/sync/user/user-sync-manager';
import GewisDBSyncService from './gewis/service/gewisdb-sync-service';
import ServerSettingsStore from './server-settings/server-settings-store';
import UserNotificationPreferenceService from './service/user-notification-preference-service';
import WrappedService from './service/wrapped-service';
import Config from './config';
import { applyConfiguredLogLevel } from './helpers/logging';

class MaintenanceApplication {
  logger: Logger;

  connection: DataSource;

  roleManager: RoleManager;

  public async stop(): Promise<void> {
    await this.connection.destroy();
    this.logger.info('maintenance.stopped');
  }
}

/**
 * Validates that the environment is set to development
 */
function validateDevelopmentEnvironment(logger: Logger): void {
  const config = Config.get();
  if (!config.app.isDevelopment) {
    logger.error('maintenance.environment_invalid');
    logger.error('maintenance.environment_invalid.current', { nodeEnv: config.app.nodeEnv || 'undefined' });
    logger.error('maintenance.environment_invalid.expected', { nodeEnv: 'development' });
    process.exit(1);
  }
  logger.info('maintenance.environment_validated');
}

/**
 * Performs all maintenance tasks that are normally handled by cron jobs
 */
async function performMaintenanceTasks(application: MaintenanceApplication): Promise<void> {
  const config = Config.get();
  // Set up monetary value configuration
  dinero.defaultCurrency = config.currency.code as Currency;
  dinero.defaultPrecision = config.currency.precision;
  application.logger.info('maintenance.monetary_configured');

  // Initialize database-stored settings
  const store = ServerSettingsStore.getInstance();
  if (!store.initialized) {
    await store.initialize();
    application.logger.info('maintenance.server_settings_initialized');
  }

  // Setup RBAC
  application.roleManager = await new RoleManager().initialize();
  application.logger.info('maintenance.role_manager_initialized');

  // Synchronize SudoSOS system roles
  application.logger.info('maintenance.sync_default_roles.started');
  await DefaultRoles.synchronize();
  application.logger.info('maintenance.sync_default_roles.finished');

  // Update balances
  application.logger.info('maintenance.update_balances.started');
  await new BalanceService().updateBalances({});
  application.logger.info('maintenance.update_balances.finished');

  // Sync user notification preferences
  application.logger.info('maintenance.sync_notification_preferences.started');
  await new UserNotificationPreferenceService().syncAllUserNotificationPreferences();
  application.logger.info('maintenance.sync_notification_preferences.finished');
  // Update wrapped
  application.logger.info('maintenance.update_wrapped.started');
  await new WrappedService().updateWrapped({});
  application.logger.info('maintenance.update_wrapped.finished');

  // Setup user synchronization services based on environment variables
  const syncServices: UserSyncService[] = [];

  if (config.ldap.enabled) {
    application.logger.info('maintenance.ldap_sync.configuring');
    const ldapSyncService = new LdapSyncService(application.roleManager);
    syncServices.push(ldapSyncService);
    application.logger.info('maintenance.ldap_sync.configured');
  } else {
    application.logger.info('maintenance.ldap_sync.disabled', { reason: 'ENABLE_LDAP not set to true' });
  }

  if (config.gewis.gewisdbApiKey && config.gewis.gewisdbApiUrl) {
    application.logger.info('maintenance.gewisdb_sync.configuring');
    const gewisDBSyncService = new GewisDBSyncService();
    syncServices.push(gewisDBSyncService);
    application.logger.info('maintenance.gewisdb_sync.configured');
  } else {
    application.logger.info('maintenance.gewisdb_sync.disabled', { reason: 'missing API key or URL' });
  }

  // Run user synchronization if services are configured
  if (syncServices.length > 0) {
    application.logger.info('maintenance.user_sync.started');
    const syncManager = new UserSyncManager(syncServices);
    
    // Fetch users first
    await syncManager.fetch();
    application.logger.info('maintenance.user_sync.fetched');
    
    // Then sync users
    await syncManager.run();
    application.logger.info('maintenance.user_sync.finished');
  } else {
    application.logger.info('maintenance.user_sync.skipped');
  }

  application.logger.info('maintenance.tasks_finished');
}

/**
 * Main maintenance function
 */
async function runMaintenance(): Promise<void> {
  try {
    // Initialize application
    const application = new MaintenanceApplication();
    application.connection = await Database.initialize();
    application.logger = log4js.getLogger('Maintenance');
    applyConfiguredLogLevel(application.logger);
    application.logger.info('maintenance.started');

    console.log = (message: any, ...additional: any[]) => application.logger.debug(message, ...additional);

    // Validate environment
    validateDevelopmentEnvironment(application.logger);
    
    // Perform maintenance tasks
    await performMaintenanceTasks(application);
    
    application.logger.info('maintenance.finished');
    
    await application.stop();
    
  } catch (error) {
    const logger = log4js.getLogger('Maintenance');
    logger.level = process.env.LOG_LEVEL ?? 'info';
    logger.fatal('maintenance.failed', error);
    process.exit(1);
  }
}

if (require.main === module) {
  // Only execute the maintenance directly if this is the main execution file
  void runMaintenance();
}
