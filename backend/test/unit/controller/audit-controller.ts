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

import chai from 'chai';
import { json } from 'body-parser';
import { DefaultContext, defaultContext, finishTestDB } from '../../helpers/test-helpers';
import { truncateAllTables } from '../../helpers/database-helpers';
import { ADMIN_USER, ensureProductionRoles, signTokenFor, UserFactory } from '../../helpers/user-factory';
import User from '../../../src/entity/user/user';
import TokenMiddleware from '../../../src/middleware/token-middleware';
import AuditController from '../../../src/controller/audit-controller';
import AuditService from '../../../src/service/audit-service';
import AuditLogEntry, { AuditAction, AuditEntityType } from '../../../src/entity/audit/audit-log-entry';
import { AuditLogEntryResponse } from '../../../src/controller/response/audit-log-response';

const { expect, request } = chai;

describe('AuditController', () => {
  let ctx: DefaultContext & {
    admin: User;
    localUser: User;
    adminToken: string;
    token: string;
  };

  beforeAll(async () => {
    const c = { ...(await defaultContext()) };
    await truncateAllTables(c.connection);

    const admin = await (await UserFactory(await ADMIN_USER())).get();
    const localUser = await (await UserFactory()).get();

    await ensureProductionRoles();

    const adminToken = await signTokenFor(admin, c.tokenHandler, 'nonce admin');
    const token = await signTokenFor(localUser, c.tokenHandler);

    c.app.use(json());
    c.app.use(new TokenMiddleware({ tokenHandler: c.tokenHandler, refreshFactor: 0.5 }).getMiddleware());
    c.app.use('/audit-logs', new AuditController({
      specification: c.specification, roleManager: c.roleManager,
    }).getRouter());

    ctx = { ...c, admin, localUser, adminToken, token };
  });

  beforeEach(async () => {
    await new AuditService().log(ctx.admin, {
      action: AuditAction.INVOICE_CREATE,
      entityType: AuditEntityType.INVOICE,
      entityId: 1,
    });
    await new AuditService().log(ctx.localUser, {
      action: AuditAction.INVOICE_DELETE,
      entityType: AuditEntityType.INVOICE,
      entityId: 1,
      changes: { state: 'DELETED' },
    });
    await new AuditService().log(ctx.admin, {
      action: AuditAction.PRODUCT_DELETE,
      entityType: AuditEntityType.PRODUCT,
      entityId: 2,
    });
  });

  afterEach(async () => {
    await AuditLogEntry.createQueryBuilder().delete().execute();
  });

  afterAll(async () => {
    await finishTestDB(ctx.connection);
  });

  // The enum values are repeated in the JSDoc of the response and the endpoint,
  // which is what puts them in the Swagger spec and therefore in the generated
  // client. These guard against that copy drifting from the enum it mirrors.
  describe('specification', () => {
    function schemaOf(model: string): { properties: Record<string, { enum?: string[] }> } {
      return (ctx.specification as unknown as {
        components: { schemas: Record<string, { properties: Record<string, { enum?: string[] }> }> },
      }).components.schemas[model];
    }

    it('should offer every action as an enum value', () => {
      const { properties } = schemaOf('AuditLogEntryResponse');
      expect(properties.action.enum).to.have.members(Object.values(AuditAction));
    });

    it('should offer every entity type as an enum value', () => {
      const { properties } = schemaOf('AuditLogEntryResponse');
      expect(properties.entityType.enum).to.have.members(Object.values(AuditEntityType));
    });

    it('should offer the same values as query parameters', () => {
      const parameters = (ctx.specification as unknown as {
        paths: Record<string, { get: { parameters: { name: string, schema?: { enum?: string[] } }[] } }>,
      }).paths['/audit-logs'].get.parameters;
      const enumOf = (name: string) => parameters.find((p) => p.name === name)?.schema?.enum;

      expect(enumOf('action')).to.have.members(Object.values(AuditAction));
      expect(enumOf('entityType')).to.have.members(Object.values(AuditEntityType));
    });
  });

  describe('GET /audit-logs', () => {
    it('should return correct model', async () => {
      const res = await request(ctx.app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${ctx.adminToken}`);

      expect(res.status).to.equal(200);
      const validator = ctx.specification.validateModel(
        'PaginatedAuditLogEntryResponse',
        res.body,
        false,
        true,
      );
      expect(validator.valid).to.be.true;
    });

    it('should return an HTTP 200 and all entries if admin', async () => {
      const res = await request(ctx.app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${ctx.adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body._pagination.count).to.equal(3);

      const entries = res.body.records as AuditLogEntryResponse[];
      expect(entries.map((e) => e.action)).to.deep.equal([
        AuditAction.PRODUCT_DELETE,
        AuditAction.INVOICE_DELETE,
        AuditAction.INVOICE_CREATE,
      ]);
      expect(entries[1].actor.id).to.equal(ctx.localUser.id);
      expect(entries[1].actorName).to.equal(`${ctx.localUser.firstName} ${ctx.localUser.lastName}`);
      expect(entries[1].changes).to.deep.equal({ state: 'DELETED' });
    });

    it('should return an HTTP 403 if not admin', async () => {
      const res = await request(ctx.app)
        .get('/audit-logs')
        .set('Authorization', `Bearer ${ctx.token}`);

      expect(res.status).to.equal(403);
      expect(res.body).to.be.empty;
    });

    it('should filter on the mutated object', async () => {
      const res = await request(ctx.app)
        .get('/audit-logs?entityType=Invoice&entityId=1')
        .set('Authorization', `Bearer ${ctx.adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body._pagination.count).to.equal(2);
      const entries = res.body.records as AuditLogEntryResponse[];
      expect(entries.every((e) => e.entityType === AuditEntityType.INVOICE)).to.be.true;
    });

    it('should filter on the actor', async () => {
      const res = await request(ctx.app)
        .get(`/audit-logs?actorId=${ctx.localUser.id}`)
        .set('Authorization', `Bearer ${ctx.adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body._pagination.count).to.equal(1);
    });

    it('should filter on the action', async () => {
      const res = await request(ctx.app)
        .get('/audit-logs?action=invoice.delete')
        .set('Authorization', `Bearer ${ctx.adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body._pagination.count).to.equal(1);
    });

    it('should adhere to pagination', async () => {
      const res = await request(ctx.app)
        .get('/audit-logs?take=2&skip=1')
        .set('Authorization', `Bearer ${ctx.adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body._pagination).to.deep.equal({ take: 2, skip: 1, count: 3 });
      expect(res.body.records).to.be.length(2);
    });

    it('should filter on a uuid entity id', async () => {
      const uuid = '6f1c1e2a-9a4b-4c1d-8f0e-3b2a1c0d9e8f';
      await new AuditService().log(ctx.admin, {
        action: AuditAction.PAYMENT_REQUEST_CANCEL,
        entityType: AuditEntityType.PAYMENT_REQUEST,
        entityId: uuid,
      });

      const res = await request(ctx.app)
        .get(`/audit-logs?entityType=PaymentRequest&entityId=${uuid}`)
        .set('Authorization', `Bearer ${ctx.adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body._pagination.count).to.equal(1);
      expect((res.body.records as AuditLogEntryResponse[])[0].entityId).to.equal(uuid);
    });

    describe('date filters', () => {
      // Moves the invoice.create entry back in time, so the date filters have
      // something to tell apart from the two entries recorded just now.
      // createdAt is a CreateDateColumn, which TypeORM leaves out of updates, hence raw SQL.
      beforeEach(async () => {
        await ctx.connection.query(
          'UPDATE audit_log_entry SET createdAt = ? WHERE action = ?',
          ['2020-01-01 00:00:00.000', AuditAction.INVOICE_CREATE],
        );
      });

      it('should only return entries on or after fromDate', async () => {
        const res = await request(ctx.app)
          .get('/audit-logs?fromDate=2021-01-01T00:00:00.000Z')
          .set('Authorization', `Bearer ${ctx.adminToken}`);

        expect(res.status).to.equal(200);
        const actions = (res.body.records as AuditLogEntryResponse[]).map((e) => e.action);
        expect(actions).to.have.members([AuditAction.PRODUCT_DELETE, AuditAction.INVOICE_DELETE]);
      });

      it('should only return entries before tillDate', async () => {
        const res = await request(ctx.app)
          .get('/audit-logs?tillDate=2021-01-01T00:00:00.000Z')
          .set('Authorization', `Bearer ${ctx.adminToken}`);

        expect(res.status).to.equal(200);
        const actions = (res.body.records as AuditLogEntryResponse[]).map((e) => e.action);
        expect(actions).to.deep.equal([AuditAction.INVOICE_CREATE]);
      });

      it('should combine fromDate and tillDate', async () => {
        const res = await request(ctx.app)
          .get('/audit-logs?fromDate=2019-01-01T00:00:00.000Z&tillDate=2021-01-01T00:00:00.000Z')
          .set('Authorization', `Bearer ${ctx.adminToken}`);

        expect(res.status).to.equal(200);
        expect(res.body._pagination.count).to.equal(1);

        const empty = await request(ctx.app)
          .get('/audit-logs?fromDate=2021-01-01T00:00:00.000Z&tillDate=2021-06-01T00:00:00.000Z')
          .set('Authorization', `Bearer ${ctx.adminToken}`);
        expect(empty.status).to.equal(200);
        expect(empty.body._pagination.count).to.equal(0);
      });
    });

    it('should return an HTTP 400 if pagination is invalid', async () => {
      const res = await request(ctx.app)
        .get('/audit-logs?take=invalid')
        .set('Authorization', `Bearer ${ctx.adminToken}`);

      expect(res.status).to.equal(400);
    });

    [
      ['actorId is not a number', 'actorId=abc'],
      ['action is unknown', 'action=invoice.explode'],
      ['entityType is unknown', 'entityType=Unicorn'],
      ['entityId is given twice', 'entityId=1&entityId=2'],
      ['entityId is empty', 'entityId='],
      ['entityId is too long', `entityId=${'x'.repeat(65)}`],
      ['fromDate is not a date', 'fromDate=yesterday-ish'],
      ['tillDate is not a date', 'tillDate=tomorrow-ish'],
    ].forEach(([reason, query]) => {
      it(`should return an HTTP 400 if ${reason}`, async () => {
        const res = await request(ctx.app)
          .get(`/audit-logs?${query}`)
          .set('Authorization', `Bearer ${ctx.adminToken}`);

        expect(res.status).to.equal(400);
      });
    });
  });
});
