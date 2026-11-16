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

import { expect } from 'chai';
import { DataSource } from 'typeorm';
import dinero from 'dinero.js';
import { SwaggerSpecification } from 'swagger-model-validator';
import Database from '../../../src/database/database';
import WrappedService, { UpdateWrappedParameters } from '../../../src/service/wrapped-service';
import Wrapped from '../../../src/entity/wrapped';
import WrappedOrganMember from '../../../src/entity/wrapped/wrapped-organ-member';
import User, { UserType } from '../../../src/entity/user/user';
import Transaction from '../../../src/entity/transactions/transaction';
import SubTransaction from '../../../src/entity/transactions/sub-transaction';
import SubTransactionRow from '../../../src/entity/transactions/sub-transaction-row';
import PointOfSaleRevision from '../../../src/entity/point-of-sale/point-of-sale-revision';
import ProductRevision from '../../../src/entity/product/product-revision';
import ContainerRevision from '../../../src/entity/container/container-revision';
import OrganMembership from '../../../src/entity/organ/organ-membership';
import VatGroup from '../../../src/entity/vat-group';
import ProductCategory from '../../../src/entity/product/product-category';
import ProductService from '../../../src/service/product-service';
import ContainerService from '../../../src/service/container-service';
import PointOfSaleService from '../../../src/service/point-of-sale-service';
import Swagger from '../../../src/start/swagger';
import { finishTestDB } from '../../helpers/test-helpers';
import { truncateAllTables } from '../../helpers/database-helpers';

const YEAR = 2023;

interface Shop {
  organ: User;
  container: ContainerRevision;
  pointOfSale: PointOfSaleRevision;
}

describe('WrappedService', (): void => {
  let ctx: {
    connection: DataSource,
    specification: SwaggerSpecification,
    service: WrappedService,
    alice: User,
    bob: User,
    carol: User,
    optedOut: User,
    inactive: User,
    beer: ProductRevision,
    snack: ProductRevision,
    bar: Shop,
    closedBar: Shop,
  };

  const createUser = (firstName: string, overrides: Partial<User> = {}) => User.save(Object.assign(new User(), {
    firstName,
    lastName: 'Wrapped',
    type: UserType.MEMBER,
    active: true,
    deleted: false,
    extensiveDataProcessing: true,
    tosRequired: false,
    ...overrides,
  }));

  const createShop = async (organ: User, products: ProductRevision[]): Promise<Shop> => {
    const container = await ContainerService.createContainer({
      ownerId: organ.id,
      name: `Fridge of ${organ.firstName}`,
      public: true,
      products: products.map((p) => p.productId),
    });
    const pointOfSale = await PointOfSaleService.createPointOfSale({
      ownerId: organ.id,
      name: `Bar of ${organ.firstName}`,
      containers: [container.containerId],
      useAuthentication: false,
    });
    return { organ, container, pointOfSale };
  };

  const buy = (
    from: User,
    createdAt: Date,
    rows: [ProductRevision, number][],
    { createdBy = from, shop = ctx.bar }: { createdBy?: User, shop?: Shop } = {},
  ) => ctx.connection.manager.save(Object.assign(new Transaction(), {
    from,
    createdBy,
    pointOfSale: shop.pointOfSale,
    createdAt,
    subTransactions: [Object.assign(new SubTransaction(), {
      to: shop.organ,
      container: shop.container,
      createdAt,
      subTransactionRows: rows.map(([product, amount]) => Object.assign(new SubTransactionRow(), {
        product,
        amount,
        createdAt,
      })),
    })],
  }));

  const update = (params: UpdateWrappedParameters = {}) => ctx.service.updateWrapped({ year: YEAR, ...params });

  const wrappedOf = (user: User) => ctx.service.getWrappedForUser(user.id, YEAR);

  beforeAll(async () => {
    const connection = await Database.initialize();
    await truncateAllTables(connection);

    const [alice, bob, carol] = await Promise.all(['Alice', 'Bob', 'Carol'].map((name) => createUser(name)));
    const optedOut = await createUser('OptedOut', { extensiveDataProcessing: false });
    const inactive = await createUser('Inactive', { active: false });
    const organ = await createUser('Organ', { type: UserType.ORGAN, extensiveDataProcessing: false });
    const closedOrgan = await createUser('ClosedOrgan', {
      type: UserType.ORGAN, extensiveDataProcessing: false, active: false,
    });
    await OrganMembership.save([alice, bob, carol, optedOut].flatMap((user, index) => [organ, closedOrgan].map((o) => (
      Object.assign(new OrganMembership(), { userId: user.id, organId: o.id, index })
    ))));

    const vat = await VatGroup.save(Object.assign(new VatGroup(), {
      name: 'High', percentage: 21, deleted: false, hidden: false,
    }));
    const category = await ProductCategory.save(Object.assign(new ProductCategory(), { name: 'Drinks' }));
    const createProduct = (name: string, amount: number) => ProductService.createProduct({
      ownerId: organ.id,
      name,
      priceInclVat: { amount, currency: dinero.defaultCurrency, precision: dinero.defaultPrecision },
      vat: vat.id,
      category: category.id,
      alcoholPercentage: 0,
    });
    const beer = await createProduct('Beer', 100);
    const snack = await createProduct('Snack', 250);

    ctx = {
      connection,
      specification: await Swagger.importSpecification(),
      service: new WrappedService(connection.manager),
      alice,
      bob,
      carol,
      optedOut,
      inactive,
      beer,
      snack,
      bar: await createShop(organ, [beer, snack]),
      closedBar: await createShop(closedOrgan, [beer, snack]),
    };
  });

  beforeEach(async () => {
    for (const entity of [SubTransactionRow, SubTransaction, Transaction, WrappedOrganMember, Wrapped]) {
      await ctx.connection.manager.createQueryBuilder().delete().from(entity).execute();
    }
  });

  afterAll(async () => {
    await finishTestDB(ctx.connection);
  });

  describe('updateWrapped', () => {
    it('should only create a Wrapped for active users that allow extensive data processing', async () => {
      await update();

      const userIds = (await Wrapped.find()).map((w) => w.userId);
      expect(userIds).to.have.members([ctx.alice.id, ctx.bob.id, ctx.carol.id]);
    });

    it('should remove the Wrapped of a user that is no longer eligible', async () => {
      await update();
      await User.update(ctx.carol.id, { extensiveDataProcessing: false });

      try {
        await update();
        expect(await wrappedOf(ctx.carol)).to.be.null;
      } finally {
        await User.update(ctx.carol.id, { extensiveDataProcessing: true });
      }
    });

    it('should not fail when no requested user is eligible', async () => {
      await update({ ids: [ctx.optedOut.id] });

      expect(await Wrapped.count()).to.equal(0);
    });

    it('should keep the Wrapped of other years', async () => {
      await buy(ctx.alice, new Date(YEAR - 1, 5, 1, 12), [[ctx.beer, 1]]);
      await update({ year: YEAR - 1 });

      await update();
      await update({ ids: [ctx.alice.id] });

      expect((await ctx.service.getWrappedForUser(ctx.alice.id, YEAR - 1)).transactionCount).to.equal(1);
      expect((await wrappedOf(ctx.alice)).transactionCount).to.equal(0);
    });

    it('should count the transactions of the year', async () => {
      await buy(ctx.alice, new Date(YEAR - 1, 5, 1, 12), [[ctx.beer, 1]]);
      await buy(ctx.alice, new Date(YEAR, 5, 1, 12), [[ctx.beer, 1], [ctx.snack, 1]]);
      await buy(ctx.alice, new Date(YEAR, 5, 2, 12), [[ctx.beer, 1]]);
      await buy(ctx.alice, new Date(YEAR + 1, 5, 1, 12), [[ctx.beer, 1]]);

      await update();

      const wrapped = await wrappedOf(ctx.alice);
      expect(wrapped.transactionCount).to.equal(2);
      expect(wrapped.syncedFrom.getFullYear()).to.equal(YEAR);
      expect((await wrappedOf(ctx.carol)).transactionCount).to.equal(0);
    });

    it('should let a day run from 06:00 to 06:00', async () => {
      await buy(ctx.alice, new Date(YEAR, 0, 1, 5, 59), [[ctx.beer, 1]]);
      await buy(ctx.alice, new Date(YEAR, 0, 1, 6, 0), [[ctx.beer, 1]]);
      await buy(ctx.alice, new Date(YEAR, 0, 2, 1, 30), [[ctx.beer, 1]]);
      await buy(ctx.alice, new Date(YEAR, 2, 26, 12), [[ctx.beer, 1]]);
      await buy(ctx.alice, new Date(YEAR + 1, 0, 1, 3), [[ctx.beer, 1]]);

      await update();

      const { transactionHeatmap, transactionCount } = await wrappedOf(ctx.alice);
      expect(transactionCount).to.equal(4);
      expect(transactionHeatmap).to.have.length(365);
      expect(transactionHeatmap[0]).to.equal(2);
      expect(transactionHeatmap[84]).to.equal(1);
      expect(transactionHeatmap[364]).to.equal(1);
    });

    it('should give a leap year 366 days', async () => {
      await buy(ctx.alice, new Date(2024, 11, 31, 12), [[ctx.beer, 1]]);

      await update({ year: 2024 });

      const { transactionHeatmap } = await ctx.service.getWrappedForUser(ctx.alice.id, 2024);
      expect(transactionHeatmap).to.have.length(366);
      expect(transactionHeatmap[365]).to.equal(1);
    });

    it('should find the busiest day', async () => {
      await buy(ctx.alice, new Date(YEAR, 3, 10, 20), [[ctx.beer, 1]]);
      await buy(ctx.alice, new Date(YEAR, 8, 14, 22), [[ctx.beer, 1]]);
      await buy(ctx.alice, new Date(YEAR, 8, 15, 2), [[ctx.beer, 1]]);

      await update();

      const wrapped = await wrappedOf(ctx.alice);
      expect(wrapped.transactionMaxAmount).to.equal(2);
      expect(wrapped.transactionMaxDate).to.deep.equal(new Date(YEAR, 8, 14));

      const empty = await wrappedOf(ctx.carol);
      expect(empty.transactionMaxAmount).to.equal(0);
      expect(empty.transactionMaxDate).to.be.null;
    });

    it('should rank users among the users with transactions that year', async () => {
      await buy(ctx.alice, new Date(YEAR, 1, 1, 12), [[ctx.beer, 1]]);
      await buy(ctx.alice, new Date(YEAR, 1, 2, 12), [[ctx.beer, 1]]);
      await buy(ctx.bob, new Date(YEAR, 1, 1, 12), [[ctx.snack, 4]]);
      await buy(ctx.optedOut, new Date(YEAR, 1, 1, 12), [[ctx.snack, 40]]);
      await buy(ctx.bob, new Date(YEAR - 1, 1, 1, 12), [[ctx.beer, 1]]);
      await buy(ctx.bob, new Date(YEAR - 1, 1, 2, 12), [[ctx.beer, 1]]);

      await update();

      const [alice, bob, carol] = await Promise.all([ctx.alice, ctx.bob, ctx.carol].map(wrappedOf));
      expect(alice.transactionPercentile).to.equal(50);
      expect(alice.spentPercentile).to.equal(100);
      expect(bob.transactionPercentile).to.equal(100);
      expect(bob.spentPercentile).to.equal(50);
      expect(carol.transactionPercentile).to.equal(100);
      expect(carol.spentPercentile).to.equal(100);
    });

    it('should only update the requested users, ranked among all users', async () => {
      await buy(ctx.alice, new Date(YEAR, 1, 1, 12), [[ctx.beer, 1]]);
      await update();
      const before = await wrappedOf(ctx.alice);

      await buy(ctx.alice, new Date(YEAR, 1, 2, 12), [[ctx.beer, 1]]);
      await buy(ctx.bob, new Date(YEAR, 1, 2, 12), [[ctx.beer, 1]]);
      await buy(ctx.bob, new Date(YEAR, 1, 3, 12), [[ctx.beer, 1]]);
      await buy(ctx.bob, new Date(YEAR, 1, 4, 12), [[ctx.beer, 1]]);
      await update({ ids: [ctx.bob.id] });

      const alice = await wrappedOf(ctx.alice);
      expect(alice.transactionCount).to.equal(1);
      expect(alice.syncedTo).to.deep.equal(before.syncedTo);
      const bob = await wrappedOf(ctx.bob);
      expect(bob.transactionCount).to.equal(3);
      expect(bob.transactionPercentile).to.equal(50);
    });

    it('should rank organ members among the sellers of their organ', async () => {
      await buy(ctx.carol, new Date(YEAR, 4, 1, 21), [[ctx.beer, 1], [ctx.snack, 1]], { createdBy: ctx.alice });
      await buy(ctx.carol, new Date(YEAR, 4, 1, 22), [[ctx.beer, 1]], { createdBy: ctx.bob });
      await buy(ctx.carol, new Date(YEAR, 4, 1, 23), [[ctx.beer, 1]], { createdBy: ctx.bob });
      await buy(ctx.carol, new Date(YEAR, 4, 2, 21), [[ctx.snack, 40]], { createdBy: ctx.optedOut });
      await buy(ctx.carol, new Date(YEAR - 1, 4, 1, 21), [[ctx.snack, 40]], { createdBy: ctx.bob });
      await buy(ctx.carol, new Date(YEAR, 4, 3, 21), [[ctx.snack, 40]], { createdBy: ctx.bob, shop: ctx.closedBar });

      await update();

      const organsOf = async (user: User) => (await wrappedOf(user)).organs.map((o) => ({
        organId: o.organId, transactions: o.ordinalTransactionCreated, turnover: o.ordinalTurnoverCreated,
      }));
      expect(await organsOf(ctx.alice)).to.deep.equal([{ organId: ctx.bar.organ.id, transactions: 1, turnover: 0 }]);
      expect(await organsOf(ctx.bob)).to.deep.equal([{ organId: ctx.bar.organ.id, transactions: 0, turnover: 1 }]);
      expect(await organsOf(ctx.carol)).to.be.empty;
    });

    it('should replace the organ rankings of the requested users', async () => {
      await buy(ctx.carol, new Date(YEAR, 4, 1, 21), [[ctx.beer, 1]], { createdBy: ctx.alice });
      await update();

      await buy(ctx.carol, new Date(YEAR, 4, 2, 21), [[ctx.beer, 5]], { createdBy: ctx.bob });
      await update({ ids: [ctx.bob.id] });

      expect((await wrappedOf(ctx.alice)).organs[0].ordinalTurnoverCreated).to.equal(0);
      expect((await wrappedOf(ctx.bob)).organs[0].ordinalTurnoverCreated).to.equal(0);
      expect(await WrappedOrganMember.count()).to.equal(2);
    });
  });

  describe('getWrappedForUser', () => {
    it('should return the most recent Wrapped when no year is given', async () => {
      await update({ year: YEAR - 1 });
      await update();

      expect((await ctx.service.getWrappedForUser(ctx.alice.id)).year).to.equal(YEAR);
      expect((await ctx.service.getWrappedForUser(ctx.alice.id, YEAR - 1)).year).to.equal(YEAR - 1);
      expect(await ctx.service.getWrappedForUser(ctx.alice.id, YEAR - 2)).to.be.null;
    });
  });

  describe('currentYear', () => {
    afterEach(() => {
      delete process.env.WRAPPED_YEAR;
    });

    it('should be the current year, and the previous year in January', () => {
      expect(WrappedService.currentYear(new Date(2026, 10, 19))).to.equal(2026);
      expect(WrappedService.currentYear(new Date(2026, 11, 31))).to.equal(2026);
      expect(WrappedService.currentYear(new Date(2027, 0, 31))).to.equal(2026);
      expect(WrappedService.currentYear(new Date(2027, 1, 1))).to.equal(2027);
    });

    it('should be overridden by WRAPPED_YEAR', () => {
      process.env.WRAPPED_YEAR = '2021';

      expect(WrappedService.currentYear(new Date(2026, 11, 1))).to.equal(2021);
    });
  });

  describe('asWrappedResponse', () => {
    it('should return a valid response', async () => {
      await buy(ctx.carol, new Date(YEAR, 4, 1, 21), [[ctx.beer, 1]], { createdBy: ctx.alice });
      await buy(ctx.alice, new Date(YEAR, 4, 1, 21), [[ctx.beer, 1]]);
      await update();

      const response = WrappedService.asWrappedResponse(await wrappedOf(ctx.alice));

      const validation = ctx.specification.validateModel('WrappedResponse', response, false, true);
      expect(validation.valid, JSON.stringify(validation.errors)).to.be.true;
      expect(response.transactions.transactionMaxDate).to.equal(new Date(YEAR, 4, 1).toISOString());
      expect(response.organs).to.have.length(1);
    });

    it('should omit the busiest day of a user without transactions', async () => {
      await update();

      const response = WrappedService.asWrappedResponse(await wrappedOf(ctx.carol));

      expect(ctx.specification.validateModel('WrappedResponse', response, false, true).valid).to.be.true;
      expect(response.transactions.transactionMaxDate).to.be.undefined;
    });
  });
});
