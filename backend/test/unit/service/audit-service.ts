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

import { DataSource } from 'typeorm';
import { expect } from 'chai';
import sinon from 'sinon';
import { defaultContext, finishTestDB } from '../../helpers/test-helpers';
import { truncateAllTables } from '../../helpers/database-helpers';
import { UserFactory } from '../../helpers/user-factory';
import User from '../../../src/entity/user/user';
import AuditService from '../../../src/service/audit-service';
import AuditLogEntry, { AuditAction, AuditEntityType } from '../../../src/entity/audit/audit-log-entry';
import { AppDataSource } from '../../../src/database/database';

describe('AuditService', () => {
  let ctx: {
    connection: DataSource;
    actor: User;
    otherActor: User;
  };

  beforeAll(async () => {
    const c = { ...await defaultContext() };
    await truncateAllTables(c.connection);

    ctx = {
      connection: c.connection,
      actor: await (await UserFactory()).get(),
      otherActor: await (await UserFactory()).get(),
    };
  });

  afterEach(async () => {
    await AuditLogEntry.createQueryBuilder().delete().execute();
  });

  afterAll(async () => {
    await finishTestDB(ctx.connection);
  });

  describe('log', () => {
    it('should record the mutation', async () => {
      const entry = await new AuditService().log(ctx.actor, {
        action: AuditAction.INVOICE_DELETE,
        entityType: AuditEntityType.INVOICE,
        entityId: 4,
      });

      const stored = await AuditLogEntry.findOne({ where: { id: entry.id } });
      expect(stored.action).to.equal(AuditAction.INVOICE_DELETE);
      expect(stored.entityType).to.equal(AuditEntityType.INVOICE);
      expect(stored.entityId).to.equal('4');
      expect(stored.actor.id).to.equal(ctx.actor.id);
      expect(stored.changes).to.be.null;
    });

    it('should store the name the actor had at the time', async () => {
      const entry = await new AuditService().log(ctx.actor, {
        action: AuditAction.PRODUCT_UPDATE,
        entityType: AuditEntityType.PRODUCT,
        entityId: 1,
      });

      expect(entry.actorName).to.equal(`${ctx.actor.firstName} ${ctx.actor.lastName}`);
    });

    it('should store the changed fields', async () => {
      const entry = await new AuditService().log(ctx.actor, {
        action: AuditAction.INVOICE_UPDATE,
        entityType: AuditEntityType.INVOICE,
        entityId: 7,
        changes: { state: 'PAID', reference: 'BAC-1' },
      });

      const stored = await AuditLogEntry.findOne({ where: { id: entry.id } });
      expect(stored.changes).to.deep.equal({ state: 'PAID', reference: 'BAC-1' });
    });

    it('should store a uuid entity id as is', async () => {
      const uuid = '6f1c1e2a-9a4b-4c1d-8f0e-3b2a1c0d9e8f';
      const entry = await new AuditService().log(ctx.actor, {
        action: AuditAction.PAYMENT_REQUEST_CREATE,
        entityType: AuditEntityType.PAYMENT_REQUEST,
        entityId: uuid,
      });

      const stored = await AuditLogEntry.findOne({ where: { id: entry.id } });
      expect(stored.entityId).to.equal(uuid);
    });

    it('should record nothing when the surrounding transaction is rolled back', async () => {
      await expect(AppDataSource.manager.transaction(async (manager) => {
        await new AuditService(manager).log(ctx.actor, {
          action: AuditAction.INVOICE_DELETE,
          entityType: AuditEntityType.INVOICE,
          entityId: 9,
        });
        throw new Error('mutation failed');
      })).to.eventually.be.rejectedWith('mutation failed');

      expect(await AuditLogEntry.count()).to.equal(0);
    });
  });

  describe('logCommitted', () => {
    afterEach(() => {
      sinon.restore();
    });

    it('should record the mutation', async () => {
      const entry = await new AuditService().logCommitted(ctx.actor, {
        action: AuditAction.PRODUCT_DELETE,
        entityType: AuditEntityType.PRODUCT,
        entityId: 3,
      });

      expect(entry).to.not.be.undefined;
      expect(await AuditLogEntry.count()).to.equal(1);
    });

    it('should swallow a failed insert instead of throwing', async () => {
      sinon.stub(AuditService.prototype, 'log').rejects(new Error('insert failed'));

      const entry = await new AuditService().logCommitted(ctx.actor, {
        action: AuditAction.PRODUCT_DELETE,
        entityType: AuditEntityType.PRODUCT,
        entityId: 3,
      });

      expect(entry).to.be.undefined;
    });
  });

  describe('getAuditLogEntries', () => {
    beforeEach(async () => {
      await new AuditService().log(ctx.actor, {
        action: AuditAction.INVOICE_CREATE,
        entityType: AuditEntityType.INVOICE,
        entityId: 1,
      });
      await new AuditService().log(ctx.otherActor, {
        action: AuditAction.INVOICE_DELETE,
        entityType: AuditEntityType.INVOICE,
        entityId: 1,
      });
      await new AuditService().log(ctx.otherActor, {
        action: AuditAction.PRODUCT_DELETE,
        entityType: AuditEntityType.PRODUCT,
        entityId: 2,
      });
    });

    it('should return every entry, newest first', async () => {
      const [entries, count] = await new AuditService().getAuditLogEntries();

      expect(count).to.equal(3);
      expect(entries.map((e) => e.action)).to.deep.equal([
        AuditAction.PRODUCT_DELETE,
        AuditAction.INVOICE_DELETE,
        AuditAction.INVOICE_CREATE,
      ]);
    });

    it('should filter on the mutated object', async () => {
      const [entries, count] = await new AuditService().getAuditLogEntries({
        entityType: AuditEntityType.INVOICE,
        entityId: '1',
      });

      expect(count).to.equal(2);
      expect(entries.every((e) => e.entityType === AuditEntityType.INVOICE)).to.be.true;
    });

    it('should filter on the actor', async () => {
      const [entries, count] = await new AuditService().getAuditLogEntries({
        actorId: ctx.otherActor.id,
      });

      expect(count).to.equal(2);
      expect(entries.every((e) => e.actor.id === ctx.otherActor.id)).to.be.true;
    });

    it('should filter on the action', async () => {
      const [, count] = await new AuditService().getAuditLogEntries({
        action: AuditAction.INVOICE_DELETE,
      });

      expect(count).to.equal(1);
    });

    it('should paginate', async () => {
      const [entries, count] = await new AuditService().getAuditLogEntries({}, { take: 2, skip: 1 });

      expect(count).to.equal(3);
      expect(entries).to.be.length(2);
      expect(entries[0].action).to.equal(AuditAction.INVOICE_DELETE);
    });
  });
});
