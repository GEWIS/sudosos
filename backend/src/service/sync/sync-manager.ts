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

import WithManager from '../../database/with-manager';
import { SyncResult, SyncService } from './sync-service';
import log4js, { Logger } from 'log4js';

export interface SyncResults<T> {
  passed: T[];
  failed: T[];
  skipped: T[];
}

/**
 * The id of a sync target, so log lines carry the id instead of the whole entity.
 */
function entityId(entity: unknown): unknown {
  return (entity as { id?: unknown } | undefined)?.id;
}

export default abstract class SyncManager<T, S extends SyncService<T>> extends WithManager {

  protected readonly services: S[];

  protected logger: Logger = log4js.getLogger('SyncManager');

  constructor(services: S[]) {
    super();
    this.configureLogger(this.logger);
    this.services = services;
  }

  abstract getTargets(): Promise<T[]>;

  async run(isDryRun: boolean = false): Promise<SyncResults<T>> {
    this.logger.trace('sync.run.started', { isDryRun });
    const entities = await this.getTargets();
    const result: SyncResults<T> = {
      passed: [],
      failed: [],
      skipped: [],
    };

    try {
      await this.pre();
    } catch (error) {
      this.logger.error('sync.run.failed', error);
      return result;
    }

    for (const entity of entities) {
      try {
        const syncResult = await this.sync(entity, isDryRun);

        if (syncResult.skipped) {
          this.logger.trace('sync.entity_skipped', { id: entityId(entity) });
          result.skipped.push(entity);
          continue;
        }

        if (syncResult.result === false) {
          this.logger.warn('sync.entity_failed', { id: entityId(entity) });
          result.failed.push(entity);
          await this.down(entity, isDryRun);
        } else {
          this.logger.trace('sync.entity_passed', { id: entityId(entity) });
          result.passed.push(entity);
        }

      } catch (error) {
        this.logger.error('sync.entity.failed', { id: entityId(entity) }, error);
        result.failed.push(entity);
      }
    }
    await this.post();
    return result;
  }

  async runDry(): Promise<SyncResults<T>> {
    return this.run(true);
  }

  async sync(entity: T, isDryRun: boolean = false): Promise<SyncResult> {
    const syncResult: SyncResult = { skipped: true, result: false };

    // Aggregate results from all services
    for (const service of this.services) {
      const result = await service.up(entity, isDryRun);

      if (!result.skipped) syncResult.skipped = false;
      if (result.result) syncResult.result = true;
    }

    return syncResult;
  }

  async down(entity: T, isDryRun: boolean = false): Promise<void> {
    for (const service of this.services) {
      try {
        await service.down(entity, isDryRun);
      } catch (error) {
        this.logger.error('sync.down.failed', { id: entityId(entity) }, error);
      }
    }
  }

  async fetch(): Promise<void> {
    for (const service of this.services) {
      try {
        await service.pre();
        await service.fetch();
      } catch (error) {
        this.logger.error('sync.fetch.failed', { service: service.constructor.name }, error);
      }
      await service.post();
    }
  }

  async pre(): Promise<void> {
    for (const service of this.services) {
      await service.pre();
    }
  }

  async post(): Promise<void> {
    for (const service of this.services) {
      await service.post();
    }
  }
}
