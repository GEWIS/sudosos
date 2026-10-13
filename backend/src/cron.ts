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
 * This is the module page the cron job service.
 *
 * @module internal/cron
 */

import log4js, { Logger } from 'log4js';
import Database from './database/database';
import dinero, { Currency } from 'dinero.js';
import { DataSource } from 'typeorm';
import cron from 'node-cron';
import BalanceService from './service/balance-service';
import RoleManager from './rbac/role-manager';
import EventService from './service/event-service';
import DefaultRoles from './rbac/default-roles';
import UserSyncServiceFactory from './service/sync/user/user-sync-service-factory';
import UserSyncManager from './service/sync/user/user-sync-manager';
import getAppLogger from './helpers/logging';
import ServerSettingsStore from './server-settings/server-settings-store';
import UserNotificationPreferenceService from './service/user-notification-preference-service';
import WrappedService from './service/wrapped-service';
import UserExpiryService from './service/user-expiry-service';
import Config from './config';
import { applyConfiguredLogLevel } from './helpers/logging';
import Redis from 'ioredis';
import Mailer from './mailer';
import { initRedisConnection } from './helpers/redis-connection';

class CronApplication {
  logger: Logger;

  connection: DataSource;

  tasks: cron.ScheduledTask[];

  roleManager: RoleManager;

  redisConnection: Redis | undefined;

  public async stop(): Promise<void> {
    this.tasks.forEach((task) => task.stop());
    if (this.redisConnection) {
      await this.redisConnection.quit();
    }
    await this.connection.destroy();
    this.logger.info('cron.stopped');
  }
}

async function createCronTasks(): Promise<void> {
  const config = Config.get();
  const application = new CronApplication();
  application.connection = await Database.initialize();
  application.logger = log4js.getLogger('Application');
  applyConfiguredLogLevel(application.logger);
  application.logger.info('cron.starting');

  const logger = getAppLogger('Console (cron)');
  applyConfiguredLogLevel(logger);
  console.log = (message: any, ...additional: any[]) => logger.debug(message, ...additional);

  // Set up monetary value configuration.
  dinero.defaultCurrency = config.currency.code as Currency;
  dinero.defaultPrecision = config.currency.precision;

  application.redisConnection = await initRedisConnection(logger);

  new Mailer(application.redisConnection);

  // Initialize database-stored settings
  const store = ServerSettingsStore.getInstance();
  if (!store.initialized) await store.initialize();

  // Setup RBAC.
  application.roleManager = await new RoleManager().initialize();

  // Synchronize SudoSOS system roles
  await DefaultRoles.synchronize();

  await new BalanceService().updateBalances({});
  const syncBalances = cron.schedule('41 1 * * *', () => {
    logger.debug('cron.sync_balances.started');
    new BalanceService().updateBalances({}).then(() => {
      logger.debug('cron.sync_balances.finished');
    }).catch((error => {
      logger.error('cron.sync_balances.failed', error);
    }));
  });
  await new WrappedService().updateWrapped();
  const syncWrapped = cron.schedule('45 1 * 12 *', () => {
    logger.debug('cron.sync_wrapped.started');
    new WrappedService().updateWrapped().then(() => {
      logger.debug('cron.sync_wrapped.finished');
    }).catch((error => {
      logger.error('cron.sync_wrapped.failed', error);
    }));
  });
  const syncEventShiftAnswers = cron.schedule('39 2 * * *', () => {
    logger.debug('cron.sync_event_shift_answers.started');
    EventService.syncAllEventShiftAnswers()
      .then(() => logger.debug('cron.sync_event_shift_answers.finished'))
      .catch((error) => logger.error('cron.sync_event_shift_answers.failed', error));
  });
  const sendEventPlanningReminders = cron.schedule('39 13 * * *', () => {
    logger.debug('cron.send_event_planning_reminders.started');
    EventService.sendEventPlanningReminders()
      .then(() => logger.debug('cron.send_event_planning_reminders.finished'))
      .catch((error) => logger.error('cron.send_event_planning_reminders.failed', error));
  });
  const syncUserNotificationPreferences = cron.schedule('0 1 * * *', () => {
    logger.debug('cron.sync_notification_preferences.started');
    new UserNotificationPreferenceService().syncAllUserNotificationPreferences().then(() => {
      logger.debug('cron.sync_notification_preferences.finished');
    }).catch((error) => {
      logger.error('cron.sync_notification_preferences.failed', error);
    });
  });
  const deactivateExpiredUsers = cron.schedule('45 2 * * *', () => {
    logger.debug('cron.deactivate_expired_users.started');
    new UserExpiryService().deactivateExpiredUsers().then(() => {
      logger.debug('cron.deactivate_expired_users.finished');
    }).catch((error) => {
      logger.error('cron.deactivate_expired_users.failed', error);
    });
  });
  const notifyNearExpirationUsers = cron.schedule('45 3 * * *', () => {
    logger.debug('cron.notify_near_expiration_users.started');
    new UserExpiryService().notifyNearExpirationUsers().then(() => {
      logger.debug('cron.notify_near_expiration_users.finished');
    }).catch((error) => {
      logger.error('cron.notify_near_expiration_users.failed', error);
    });
  });

  application.tasks = [syncBalances, syncWrapped, syncEventShiftAnswers, sendEventPlanningReminders, syncUserNotificationPreferences, deactivateExpiredUsers, notifyNearExpirationUsers];

  // Create sync services using the factory
  const syncServiceFactory = new UserSyncServiceFactory();
  const syncServices = syncServiceFactory.createSyncServices({
    roleManager: application.roleManager,
    manager: application.connection.manager,
  });

  if (syncServices.length !== 0) {
    application.logger.info('cron.user_sync.registering', { services: syncServices.map(s => s.constructor.name) });
    const syncManager = new UserSyncManager(syncServices);

    const userSyncer = cron.schedule('41 1 * * *', async () => {
      logger.debug('cron.user_sync.started');
      const results = await syncManager.run();
      logger.debug('cron.user_sync.finished', {
        passed: results.passed.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      });
    });
    application.tasks.push(userSyncer);

    const userFetcher = cron.schedule('*/15 * * * *', async () => {
      logger.debug('cron.user_fetch.started');
      await syncManager.fetch();
    });
    application.tasks.push(userFetcher);
  } else {
    application.logger.warn('cron.user_sync.skipped');
  }

  application.logger.info('cron.tasks_registered');
}

if (require.main === module) {
  // Only execute the application directly if this is the main execution file.
  createCronTasks().catch((e) => {
    const logger = log4js.getLogger('cron');
    logger.level = process.env.LOG_LEVEL ?? 'info';
    logger.fatal('cron.start_failed', e);
  });
}
