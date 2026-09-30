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

import { DataSource, In } from 'typeorm';
import express, { Application } from 'express';
import { SwaggerSpecification } from 'swagger-model-validator';
import User, { UserType } from '../../../src/entity/user/user';
import Transfer from '../../../src/entity/transactions/transfer';
import Transaction from '../../../src/entity/transactions/transaction';
import Database from '../../../src/database/database';
import { truncateAllTables } from '../../helpers/database-helpers';
import {
  ContainerSeeder,
  PointOfSaleSeeder,
  ProductSeeder,
  TransactionSeeder,
  TransferSeeder,
  UserSeeder,
} from '../../seed';
import Swagger from '../../../src/start/swagger';
import bodyParser from 'body-parser';
import { finishTestDB } from '../../helpers/test-helpers';
import InactiveAdministrativeCost from '../../../src/entity/transactions/inactive-administrative-cost';
import InactiveAdministrativeCostSeeder from '../../seed/ledger/inactive-administrative-cost-seeder';
import InactiveAdministrativeCostService from '../../../src/service/inactive-administrative-cost-service';
import chai, { expect } from 'chai';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import {
  BaseInactiveAdministrativeCostResponse,
  InactiveAdministrativeCostResponse,
  UserToInactiveAdministrativeCostResponse,
} from '../../../src/controller/response/inactive-administrative-cost-response';
import BalanceService from '../../../src/service/balance-service';
import {
  CreateInactiveAdministrativeCostRequest, HandoutInactiveAdministrativeCostsRequest,
} from '../../../src/controller/request/inactive-administrative-cost-request';
import TransferService from '../../../src/service/transfer-service';
import dinero from 'dinero.js';
import TransferRequest from '../../../src/controller/request/transfer-request';
import ContainerRevision from '../../../src/entity/container/container-revision';
import ProductRevision from '../../../src/entity/product/product-revision';
import PointOfSaleRevision from '../../../src/entity/point-of-sale/point-of-sale-revision';
import sinon, { SinonSandbox } from 'sinon';
import { rootStubs } from '../../root-hooks';
import Mailer from '../../../src/mailer';
import SubTransaction from '../../../src/entity/transactions/sub-transaction';
import ServerSettingsStore from '../../../src/server-settings/server-settings-store';
import { inUserContext, UserFactory } from '../../helpers/user-factory';
import VatGroup from '../../../src/entity/vat-group';
import QueryFilter from '../../../src/helpers/query-filter';
import Redis from 'ioredis';
import Notifier from '../../../src/notifications/notifier';
import { NotificationTypes } from '../../../src/notifications/notification-types';
import {
  InactiveAdministrativeCostNotificationOptions,
  UserGotInactiveAdministrativeCostOptions,
} from '../../../src/notifications/notification-options';

chai.use(deepEqualInAnyOrder);

function keyMapping(inactiveAdministrativeCost: BaseInactiveAdministrativeCostResponse | InactiveAdministrativeCostResponse | InactiveAdministrativeCost) {
  return {
    id: inactiveAdministrativeCost.id,
    fromId: inactiveAdministrativeCost.from.id,
  };
}

export type T = BaseInactiveAdministrativeCostResponse | InactiveAdministrativeCostResponse | InactiveAdministrativeCost;

function returnsAll(response: T[], superset: InactiveAdministrativeCost[], mapping: any) {
  expect(response.map(mapping)).to.deep.equalInAnyOrder(superset.map(mapping));
}

// Inactive for 2.5 years: eligible for a notification only.
const NOTIFY_INACTIVE_MONTHS = 30;
// Inactive for 3.5 years: eligible for a handout only.
const HANDOUT_INACTIVE_MONTHS = 42;

function monthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

/**
 * Creates a fresh user whose only (and therefore last) activity is a deposit made
 * `monthsInactive` months ago, leaving them with a positive balance.
 * @param monthsInactive
 * @param depositAmount
 */
async function createUserInactiveFor(monthsInactive: number, depositAmount = 1000): Promise<User> {
  const [user] = await (await UserFactory()).clone(1);

  const depositReq: TransferRequest = {
    amount: {
      amount: depositAmount,
      precision: dinero.defaultPrecision,
      currency: dinero.defaultCurrency,
    },
    description: `deposit ${monthsInactive} months ago`,
    fromId: 0,
    toId: user.id,
    createdAt: monthsAgo(monthsInactive).toString(),
  };
  await new TransferService().createTransfer(depositReq);

  return user;
}


describe('InactiveAdministrativeCostService', () => {
  let ctx: {
    connection: DataSource;
    app: Application;
    validAdminCostRequest: CreateInactiveAdministrativeCostRequest;
    specification: SwaggerSpecification;
    transactions: Transaction[];
    subTransactions: SubTransaction[];
    users: User[];
    transfers: Transfer[];
    inactiveAdministrativeCosts: InactiveAdministrativeCost[];
    pointsOfSale: PointOfSaleRevision[];
    containers: ContainerRevision[];
    products: ProductRevision[];
    mailer: Mailer;
  };

  let sandbox: SinonSandbox;
  let redis: Redis;

  beforeAll(async function test(): Promise<void> {
    const connection = await Database.initialize();
    await truncateAllTables(connection);

    const begin = new Date(2020, 1);
    const end = new Date(2021, 1);

    const users = await new UserSeeder().seed();
    const { productRevisions } = await new ProductSeeder().seed(users);
    const transfers = await new TransferSeeder().seed(users, begin, end);
    const { inactiveAdministrativeCosts, inactiveAdministrativeCostsTransfers } = await new InactiveAdministrativeCostSeeder().seed(users, begin, end);
    const { containerRevisions } = await new ContainerSeeder().seed(users, productRevisions);
    const { pointOfSaleRevisions } = await new PointOfSaleSeeder().seed(users, containerRevisions);
    const transfersUpdated = transfers.concat(inactiveAdministrativeCostsTransfers);

    const validAdminCostRequest: CreateInactiveAdministrativeCostRequest = {
      forId: users[0].id,
    };
    const user = User.create({
      firstName: 'John',
      lastName: 'Doe',
      type: UserType.LOCAL_USER,
    });
    const newUser = await user.save();
    const updatedUser = users.concat(newUser);

    const pos = pointOfSaleRevisions.filter((p) => p.pointOfSale.deletedAt == null);
    const { subTransactions, transactions } = await new TransactionSeeder().seed(users, pos, begin, end);

    await ServerSettingsStore.getInstance().initialize();

    // Create and set up high VAT group for testing
    const highVatGroup = await VatGroup.create({
      percentage: 21,
      deleted: false,
      hidden: false,
      name: 'High VAT',
    }).save();
    await ServerSettingsStore.getInstance().setSetting('highVatGroupId', highVatGroup.id);

    // start app
    const app = express();
    const specification = await Swagger.initialize(app);
    app.use(bodyParser.json());

    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null,
    });

    const mailer = new Mailer(redis);

    // initialize context
    ctx = {
      connection,
      app,
      validAdminCostRequest,
      transactions,
      subTransactions,
      specification,
      containers: containerRevisions,
      products: productRevisions,
      users: updatedUser,
      transfers: transfersUpdated,
      pointsOfSale: pointOfSaleRevisions,
      inactiveAdministrativeCosts,
      mailer,
    };
  });

  beforeEach(() => {
    // Restore the default stub
    rootStubs?.mail.restore();

    try {
      Mailer.getInstance();
    } catch (e) {
      new Mailer(redis);
    }

    sandbox = sinon.createSandbox();
  });

  // close database connection
  afterAll(async () => {
    await finishTestDB(ctx.connection);

    Mailer.reset();
    if (redis) await redis.quit();

    sandbox.restore();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getInactiveAdministrativeCosts', async (): Promise<void> => {
    it('should return all administrative costs entities', async () => {
      const res = await new InactiveAdministrativeCostService().getInactiveAdministrativeCosts();
      returnsAll(res, ctx.inactiveAdministrativeCosts, keyMapping);
    });
    it('should return administrative cost for certain user', async () => {
      const user = ctx.users[0];

      const res = await new InactiveAdministrativeCostService().getInactiveAdministrativeCosts({ fromId: user.id });
      await new BalanceService().updateBalances({});

      expect(res[0].fromId).to.be.eq(user.id);
    });
    it('should return administrative cost for a certain id', async () => {
      const inactiveAdministrativeCostId = ctx.inactiveAdministrativeCosts[0].id;

      const res = await new InactiveAdministrativeCostService().getInactiveAdministrativeCosts({ inactiveAdministrativeCostId });

      expect(res[0].id).to.be.eq(inactiveAdministrativeCostId);
    });
  });
  
  describe('createInactiveAdministrativeCost', async (): Promise<void> => {
    it('should create inactive administrative cost for certain user', async () => {
      const user = ctx.users[0];
      const previousBalance = (await new BalanceService().getBalance(user.id)).amount.amount;

      const res = await new InactiveAdministrativeCostService().createInactiveAdministrativeCost(ctx.validAdminCostRequest);
      await new BalanceService().updateBalances({});
      const newBalance = (await new BalanceService().getBalance(user.id)).amount.amount;

      const inactiveAdministrativeCosts: InactiveAdministrativeCost[] = await new InactiveAdministrativeCostService().getInactiveAdministrativeCosts();
      const lastEntry = inactiveAdministrativeCosts.reduce((prev, curr) => (prev.id < curr.id ? curr : prev));
      const transfer = await Transfer.findOne({
        where: { id: lastEntry.transfer.id },
        relations: { inactiveAdministrativeCost: true },
      });

      expect(lastEntry.id).to.be.eq(res.id);
      expect(newBalance).to.be.eq(previousBalance - res.amount.getAmount());
      expect(transfer.fromId).to.be.eq(lastEntry.fromId);
      expect(transfer.inactiveAdministrativeCost).not.be.null;
    });
  });

  describe('deleteInactiveAdministrativeCost', async (): Promise<void> => {
    it('should delete a given inactive administrative cost', async () => {
      const createdInactiveAdministrativeCost = await new InactiveAdministrativeCostService().createInactiveAdministrativeCost(ctx.validAdminCostRequest);
      const transferId = createdInactiveAdministrativeCost.transfer.id;

      await new InactiveAdministrativeCostService().deleteInactiveAdministrativeCost(createdInactiveAdministrativeCost.id);

      // Verify InactiveAdministrativeCost is deleted
      const deletedCost = await InactiveAdministrativeCost.findOne({ where: { id: createdInactiveAdministrativeCost.id } });
      expect(deletedCost).to.be.null;

      // Verify linked Transfer is deleted
      const deletedTransfer = await Transfer.findOne({ where: { id: transferId } });
      expect(deletedTransfer).to.be.null;
    });
    it('should return void when entity does not exist', async () => {
      const lastId = ctx.inactiveAdministrativeCosts.length;
      // Method should complete without throwing when entity does not exist
      await new InactiveAdministrativeCostService().deleteInactiveAdministrativeCost(lastId + 1);
    });
    it('should restore the user\'s balance when an inactive administrative cost is deleted', async () => {
      const [balanceRecords] = await new BalanceService().getBalances({});
      const user = balanceRecords.find(x => x.amount.amount > 100);

      const before = (await new BalanceService().getBalance(user.id)).amount.amount;

      const created = await new InactiveAdministrativeCostService().createInactiveAdministrativeCost({ forId: user.id });
      const transferId = created.transfer.id;
      await new BalanceService().updateBalances({});
      const afterDeduction = (await new BalanceService().getBalance(user.id)).amount.amount;

      await new InactiveAdministrativeCostService().deleteInactiveAdministrativeCost(created.id);
      await new BalanceService().updateBalances({});
      const afterRefund = (await new BalanceService().getBalance(user.id)).amount.amount;

      // Verify both entities are deleted
      const deletedCost = await InactiveAdministrativeCost.findOne({ where: { id: created.id } });
      expect(deletedCost).to.be.null;

      const deletedTransfer = await Transfer.findOne({ where: { id: transferId } });
      expect(deletedTransfer).to.be.null;

      // Verify balance is restored
      expect(afterDeduction).to.be.lessThan(before);
      expect(afterRefund).to.be.closeTo(before, 1);
    });
  });
  
  describe('checkInactiveUsers', async (): Promise<void> => {
    it('should return only users who should receive a notification and not a handout', async () => {
      const notifyUser = await createUserInactiveFor(NOTIFY_INACTIVE_MONTHS);
      const handoutUser = await createUserInactiveFor(HANDOUT_INACTIVE_MONTHS);

      await inUserContext([notifyUser, handoutUser], async () => {
        await new BalanceService().updateBalances({});

        const notifyUsers: UserToInactiveAdministrativeCostResponse[] = await new InactiveAdministrativeCostService().checkInactiveUsers({ notification: true });

        const userIds = notifyUsers.map(u => u.id);
        expect(userIds).to.include(notifyUser.id);
        expect(userIds).to.not.include(handoutUser.id);
      });
    });
    it('should return all users who should receive a handout', async () => {
      const handoutUser = await createUserInactiveFor(HANDOUT_INACTIVE_MONTHS);

      await inUserContext([handoutUser], async () => {
        await new BalanceService().updateBalances({});

        const handoutUsers: UserToInactiveAdministrativeCostResponse[] = await new InactiveAdministrativeCostService().checkInactiveUsers({ notification: false });

        const userIds = handoutUsers.map(u => u.id);
        expect(userIds).to.include(handoutUser.id);
      });
    });
    it('should split notification and handout exactly at the 2 and 3 year boundaries', async () => {
      const cases = [
        { months: 23, notification: false, handout: false }, // just below 2 years
        { months: 24, notification: true, handout: false }, // exactly 2 years
        { months: 25, notification: true, handout: false }, // just above 2 years
        { months: 35, notification: true, handout: false }, // just below 3 years
        { months: 36, notification: false, handout: true }, // exactly 3 years
        { months: 37, notification: false, handout: true }, // just above 3 years
      ];

      // Create sequentially: UserFactory derives ids from User.count(), so parallel creation collides.
      const users: User[] = [];
      for (const c of cases) {
        users.push(await createUserInactiveFor(c.months));
      }

      await inUserContext(users, async () => {
        await new BalanceService().updateBalances({});

        const service = new InactiveAdministrativeCostService();
        const notifyIds = (await service.checkInactiveUsers({ notification: true })).map(u => u.id);
        const handoutIds = (await service.checkInactiveUsers({ notification: false })).map(u => u.id);

        cases.forEach((c, i) => {
          expect(notifyIds.includes(users[i].id), `notification at ${c.months} months`).to.eq(c.notification);
          expect(handoutIds.includes(users[i].id), `handout at ${c.months} months`).to.eq(c.handout);
        });
      });
    });
    it('should still return users that had an inactive administrative cost as last transfer', async () => {
      const administrativeCostValue = ServerSettingsStore.getInstance().getSetting('administrativeCostValue') as number;
      // Deposit more than the cost, so the balance stays positive after the deduction.
      const user = await createUserInactiveFor(HANDOUT_INACTIVE_MONTHS, administrativeCostValue + 1000);

      await inUserContext([user], async () => {
        await new InactiveAdministrativeCostService().createInactiveAdministrativeCost({ forId: user.id });
        await new BalanceService().updateBalances({});

        // Verify user has positive balance
        const finalBalance = await new BalanceService().getBalance(user.id);
        expect(finalBalance.amount.amount).to.be.greaterThan(0);

        const users = await new InactiveAdministrativeCostService().checkInactiveUsers({ notification: false });

        const userIds = users.map(u => u.id);
        expect(userIds).to.include(user.id);
      });
    });
    it('should not return users which already had a notification send', async () => {
      const user = await createUserInactiveFor(NOTIFY_INACTIVE_MONTHS);

      await inUserContext([user], async () => {
        user.inactiveNotificationSend = true;
        await user.save();
        await new BalanceService().updateBalances({});

        const users = await new InactiveAdministrativeCostService().checkInactiveUsers({ notification: true });

        const userIds = users.map(u => u.id);
        expect(userIds).to.not.include(user.id);
      });
    });
    it('should not return users with balance <= 0', async () => {
      await inUserContext((await UserFactory()).clone(1), async (user: User) => {
        // Create an old transfer that gives user a negative balance and makes them eligible by date
        const oldTransferReq: TransferRequest = {
          amount: {
            amount: 100,
            precision: dinero.defaultPrecision,
            currency: dinero.defaultCurrency,
          },
          description: 'old transfer creating negative balance',
          fromId: user.id,
          toId: 0,
          createdAt: monthsAgo(NOTIFY_INACTIVE_MONTHS).toString(),
        };
        await new TransferService().createTransfer(oldTransferReq);
        await new BalanceService().updateBalances({});

        // Verify user has balance <= 0
        const finalBalance = await new BalanceService().getBalance(user.id);
        expect(finalBalance.amount.amount).to.be.at.most(0);

        const users = await new InactiveAdministrativeCostService().checkInactiveUsers({ notification: true });

        const userIds = users.map(u => u.id);
        expect(userIds).to.not.include(user.id);
      });
    });
    it('should not return users whose only recent activity is an incoming top-up', async () => {
      await inUserContext((await UserFactory()).clone(1), async (user: User) => {
        // A Stripe top-up is a transfer with no fromId (money enters from outside SudoSOS)
        // and toId equal to the user being credited.
        const topUpReq: TransferRequest = {
          amount: {
            amount: 1000,
            precision: dinero.defaultPrecision,
            currency: dinero.defaultCurrency,
          },
          description: 'recent top-up',
          fromId: undefined,
          toId: user.id,
        };
        await new TransferService().createTransfer(topUpReq);
        await new BalanceService().updateBalances({});

        const finalBalance = await new BalanceService().getBalance(user.id);
        expect(finalBalance.amount.amount).to.be.greaterThan(0);

        const users = await new InactiveAdministrativeCostService().checkInactiveUsers({ notification: true });

        const userIds = users.map(u => u.id);
        expect(userIds).to.not.include(user.id);
      });
    });
  });

  describe('handOutInactiveAdministrativeCost', async (): Promise<void> => {
    it('should mail all given users', async () => {
      const users = ctx.users.slice(8);
      const userIds = users.map((u) => u.id);

      const handoutRequest: HandoutInactiveAdministrativeCostsRequest = { userIds };

      await new InactiveAdministrativeCostService().handOutInactiveAdministrativeCost(handoutRequest);
      await User.find({ where: { id: In(userIds) } });

      expect(rootStubs.queueAdd.callCount).to.equal(users.length);
    });
    it('should notify with the deducted amount and the balance after deduction', async () => {
      const administrativeCostValue = ServerSettingsStore.getInstance().getSetting('administrativeCostValue') as number;
      const startBalance = administrativeCostValue * 3;
      const expectedBalance = startBalance - administrativeCostValue;
      const user = await createUserInactiveFor(HANDOUT_INACTIVE_MONTHS, startBalance);

      await inUserContext([user], async () => {
        const notifySpy = sandbox.spy(Notifier.getInstance(), 'notify');

        await new InactiveAdministrativeCostService().handOutInactiveAdministrativeCost({ userIds: [user.id] });

        const payload = notifySpy.getCalls().find((c) => c.args[0].userId === user.id).args[0];
        const params = payload.params as UserGotInactiveAdministrativeCostOptions;
        expect(payload.type).to.eq(NotificationTypes.UserGotInactiveAdministrativeCost);
        expect(params.amount.getAmount()).to.eq(administrativeCostValue);
        expect(params.currentUserBalance.getAmount()).to.eq(expectedBalance);

        const mailOptions = rootStubs.queueAdd.lastCall.args[1];
        expect(mailOptions.to).to.eq(user.email);
        expect(mailOptions.html).to.include(dinero({ amount: administrativeCostValue }).toFormat());
        expect(mailOptions.html).to.include(dinero({ amount: expectedBalance }).toFormat());
        expect(mailOptions.text).to.include(dinero({ amount: expectedBalance }).toFormat());
      });
    });
    it('should notify with the amount that was actually deducted, capped to the user\'s balance', async () => {
      const administrativeCostValue = ServerSettingsStore.getInstance().getSetting('administrativeCostValue') as number;
      const lowBalance = Math.floor(administrativeCostValue / 2);
      const user = await createUserInactiveFor(HANDOUT_INACTIVE_MONTHS, lowBalance);

      await inUserContext([user], async () => {
        const balance = await new BalanceService().getBalance(user.id);
        expect(balance.amount.amount).to.be.eq(lowBalance);
        expect(balance.amount.amount).to.be.lessThan(administrativeCostValue);

        const notifySpy = sandbox.spy(Notifier.getInstance(), 'notify');

        await new InactiveAdministrativeCostService().handOutInactiveAdministrativeCost({ userIds: [user.id] });

        const payload = notifySpy.getCalls().find((c) => c.args[0].userId === user.id).args[0];
        const params = payload.params as UserGotInactiveAdministrativeCostOptions;
        expect(params.amount.getAmount()).to.eq(lowBalance);
        // The whole balance is deducted, so nothing is left.
        expect(params.currentUserBalance.getAmount()).to.eq(0);

        const mailOptions = rootStubs.queueAdd.lastCall.args[1];
        expect(mailOptions.html).to.include(dinero({ amount: lowBalance }).toFormat());
        expect(mailOptions.html).to.not.include(dinero({ amount: administrativeCostValue }).toFormat());
        // Nothing is left, so the email uses the past tense and has no "avoid further costs" line.
        expect(mailOptions.html).to.include('You still had money in your SudoSOS account.');
        expect(mailOptions.html).to.not.include('Want to avoid further administrative costs?');
      });
    });
  });

  describe('sendInactiveNotification', async (): Promise<void> => {
    it('should notify all given users', async () => {
      const users = ctx.users.slice(8);
      const userIds = users.map((u) => u.id);

      const handoutRequest: HandoutInactiveAdministrativeCostsRequest = { userIds };

      await new InactiveAdministrativeCostService().sendInactiveNotification(handoutRequest);
      const updatedUsers = await User.find({ where: { id: In(userIds) } });

      expect(rootStubs.queueAdd.callCount).to.equal(users.length);
      expect(updatedUsers[0].inactiveNotificationSend).to.be.eq(true);
    });
    it('should notify of the upcoming administrative cost with the cost and the current balance', async () => {
      const administrativeCostValue = ServerSettingsStore.getInstance().getSetting('administrativeCostValue') as number;
      // Nothing is deducted yet, so the balance in the email is the balance as deposited.
      const startBalance = administrativeCostValue * 3;
      const user = await createUserInactiveFor(NOTIFY_INACTIVE_MONTHS, startBalance);

      await inUserContext([user], async () => {
        const notifySpy = sandbox.spy(Notifier.getInstance(), 'notify');

        await new InactiveAdministrativeCostService().sendInactiveNotification({ userIds: [user.id] });

        const payload = notifySpy.getCalls().find((c) => c.args[0].userId === user.id).args[0];
        const params = payload.params as InactiveAdministrativeCostNotificationOptions;
        expect(payload.type).to.eq(NotificationTypes.InactiveAdministrativeCostNotification);
        expect(params.administrativeCostValue.getAmount()).to.eq(administrativeCostValue);
        expect(params.currentUserBalance.getAmount()).to.eq(startBalance);

        const mailOptions = rootStubs.queueAdd.lastCall.args[1];
        expect(mailOptions.to).to.eq(user.email);
        expect(mailOptions.html).to.include(dinero({ amount: administrativeCostValue }).toFormat());
        expect(mailOptions.html).to.include(dinero({ amount: startBalance }).toFormat());
        expect(mailOptions.text).to.include(dinero({ amount: startBalance }).toFormat());
      });
    });
    it('should notify with the amount that will actually be deducted, capped to the user\'s balance', async () => {
      const administrativeCostValue = ServerSettingsStore.getInstance().getSetting('administrativeCostValue') as number;
      const lowBalance = Math.floor(administrativeCostValue / 2);
      const user = await createUserInactiveFor(NOTIFY_INACTIVE_MONTHS, lowBalance);

      await inUserContext([user], async () => {
        const balance = await new BalanceService().getBalance(user.id);
        expect(balance.amount.amount).to.be.eq(lowBalance);
        expect(balance.amount.amount).to.be.lessThan(administrativeCostValue);

        const notifySpy = sandbox.spy(Notifier.getInstance(), 'notify');

        await new InactiveAdministrativeCostService().sendInactiveNotification({ userIds: [user.id] });

        const payload = notifySpy.getCalls().find((c) => c.args[0].userId === user.id).args[0];
        const params = payload.params as InactiveAdministrativeCostNotificationOptions;
        expect(params.administrativeCostValue.getAmount()).to.eq(lowBalance);

        const mailOptions = rootStubs.queueAdd.lastCall.args[1];
        expect(mailOptions.html).to.include(dinero({ amount: lowBalance }).toFormat());
        expect(mailOptions.html).to.not.include(dinero({ amount: administrativeCostValue }).toFormat());
      });
    });
  });

  describe('getPaginatedInactiveAdministrativeCosts', async (): Promise<void> => {
    it('should paginate inactive administrative costs correctly', async () => {
      const [costs, count] = await new InactiveAdministrativeCostService()
        .getPaginatedInactiveAdministrativeCosts({}, { take: 2, skip: 1 });

      expect(costs).to.have.lengthOf.at.most(2);
      expect(count).to.be.a('number');
    });

  });

  describe('getInactiveAdministrativeCostReport', async (): Promise<void> => {
    it('should return report with correct date range filtering', async () => {
      const fromDate = new Date(2020, 1, 1);
      const toDate = new Date(2021, 1, 1);

      const report = await new InactiveAdministrativeCostService().getInactiveAdministrativeCostReport(fromDate, toDate);

      expect(report.fromDate).to.deep.equal(fromDate);
      expect(report.toDate).to.deep.equal(toDate);
      expect(report).to.have.property('totalAmountInclVat');
      expect(report).to.have.property('totalAmountExclVat');
      expect(report).to.have.property('vatAmount');
      expect(report).to.have.property('vatPercentage');
      expect(report).to.have.property('count');
    });

    it('should correctly sum all amounts within date range', async () => {
      const fromDate = new Date(2020, 1, 1);
      const toDate = new Date(2021, 1, 1);

      // Get all costs in the date range manually
      const allCosts = await InactiveAdministrativeCost.find({
        where: {
          createdAt: QueryFilter.createFilterWhereDate(fromDate, toDate),
        },
      });

      const report = await new InactiveAdministrativeCostService().getInactiveAdministrativeCostReport(fromDate, toDate);

      // Calculate expected total manually
      let expectedTotal = dinero({ amount: 0, currency: 'EUR', precision: 2 });
      for (const cost of allCosts) {
        expectedTotal = expectedTotal.add(cost.amount);
      }

      expect(report.totalAmountInclVat.getAmount()).to.equal(expectedTotal.getAmount());
      expect(report.count).to.equal(allCosts.length);
    });

    it('should correctly calculate VAT amounts with total as source of truth', async () => {
      const fromDate = new Date(2020, 1, 1);
      const toDate = new Date(2021, 1, 1);

      const report = await new InactiveAdministrativeCostService().getInactiveAdministrativeCostReport(fromDate, toDate);

      // Verify VAT percentage is retrieved from server settings
      const highVatGroupId = ServerSettingsStore.getInstance().getSetting('highVatGroupId') as number;
      const highVatGroup = await VatGroup.findOne({ where: { id: highVatGroupId } });
      expect(report.vatPercentage).to.equal(highVatGroup.percentage);

      // Verify VAT calculations - total (incl VAT) is the source of truth
      const totalInclVat = report.totalAmountInclVat.getAmount();
      const totalExclVat = report.totalAmountExclVat.getAmount();
      const vatAmount = report.vatAmount.getAmount();

      // Calculate base (excl VAT) from total by dividing by (1 + VAT percentage)
      const expectedExclVat = Math.round(totalInclVat / (1 + report.vatPercentage / 100));
      
      // VAT amount should be calculated as difference to ensure amounts always add up
      const expectedVatAmount = totalInclVat - expectedExclVat;

      expect(totalExclVat).to.equal(expectedExclVat);
      expect(vatAmount).to.equal(expectedVatAmount);
      // Verify amounts always add up correctly (total = base + VAT)
      expect(totalExclVat + vatAmount).to.equal(totalInclVat);
    });

    it('should return zero amounts when no costs exist in date range', async () => {
      const fromDate = new Date(2030, 1, 1);
      const toDate = new Date(2031, 1, 1);

      const report = await new InactiveAdministrativeCostService().getInactiveAdministrativeCostReport(fromDate, toDate);

      expect(report.count).to.equal(0);
      expect(report.totalAmountInclVat.getAmount()).to.equal(0);
      expect(report.totalAmountExclVat.getAmount()).to.equal(0);
      expect(report.vatAmount.getAmount()).to.equal(0);
      expect(report.vatPercentage).to.be.a('number');
    });

    it('should filter costs correctly by date range boundaries', async () => {
      // Get a cost that exists
      const existingCost = ctx.inactiveAdministrativeCosts[0];
      if (!existingCost) {
        // Skip if no costs exist
        return;
      }

      const costDate = existingCost.createdAt;

      // Test inclusive start date
      const fromDate = new Date(costDate.getTime() - 1000);
      const toDate = new Date(costDate.getTime() + 1000);
      const report = await new InactiveAdministrativeCostService().getInactiveAdministrativeCostReport(fromDate, toDate);

      // Should include the cost
      expect(report.count).to.be.greaterThan(0);

      // Test exclusive end date
      const fromDate2 = new Date(costDate.getTime() - 1000);
      const toDate2 = new Date(costDate.getTime() - 500);
      const report2 = await new InactiveAdministrativeCostService().getInactiveAdministrativeCostReport(fromDate2, toDate2);

      // Should not include the cost (end date is exclusive and before cost date)
      expect(report2.count).to.equal(0);
    });

    it('should throw error if high VAT group is not found', async () => {
      const originalVatGroupId = ServerSettingsStore.getInstance().getSetting('highVatGroupId') as number;
      await ServerSettingsStore.getInstance().setSetting('highVatGroupId', -1);

      const fromDate = new Date(2020, 1, 1);
      const toDate = new Date(2021, 1, 1);

      try {
        await new InactiveAdministrativeCostService().getInactiveAdministrativeCostReport(fromDate, toDate);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('High vat group not found');
      } finally {
        // Restore original VAT group
        await ServerSettingsStore.getInstance().setSetting('highVatGroupId', originalVatGroupId);
      }
    });
  });
});
