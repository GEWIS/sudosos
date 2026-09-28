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
import Sinon from 'sinon';
import { DataSource } from 'typeorm';
import { VoucherGroupParams, VoucherGroupRequest } from '../../../src/controller/request/voucher-group-request';
import Database from '../../../src/database/database';
import Transfer from '../../../src/entity/transactions/transfer';
import User from '../../../src/entity/user/user';
import VoucherGroup from '../../../src/entity/user/voucher-group';
import VoucherGroupService from '../../../src/service/voucher-group-service';
import { truncateAllTables } from '../../helpers/database-helpers';
import { finishTestDB } from '../../helpers/test-helpers';

const address = {
  addressee: 'Study association GEWIS',
  attention: 'Treasurer',
  street: 'Groene Loper 5',
  postalCode: '5612 AE',
  city: 'Eindhoven',
  country: 'Netherlands',
};

export function bkgEq(req: VoucherGroupParams, voucherGroup: VoucherGroup, users: User[]): void {
  // check if non user fields are equal
  expect(voucherGroup.name).to.equal(req.name);
  expect(voucherGroup.activeStartDate.toISOString()).to.equal(req.activeStartDate.toISOString());
  expect(voucherGroup.activeEndDate.toISOString()).to.equal(req.activeEndDate.toISOString());
  expect(users).to.be.of.length(req.amount);
  expect(voucherGroup.balance.getAmount()).to.equal(req.balance.getAmount());
  expect(voucherGroup.addressee).to.equal(req.addressee);
  expect(voucherGroup.street).to.equal(req.street);
  expect(voucherGroup.postalCode).to.equal(req.postalCode);
  expect(voucherGroup.city).to.equal(req.city);
  expect(voucherGroup.country).to.equal(req.country);
  if (req.invoiceDate) {
    expect(voucherGroup.invoiceDate.toISOString()).to.equal(req.invoiceDate.toISOString());
  }
}

export async function seedVoucherGroups(): Promise<{ paramss: VoucherGroupParams[], bkgIds: number[] }> {
  const paramss: VoucherGroupParams[] = [];
  const bkgIds: number[] = [];
  await Promise.all([...Array(5).keys()].map(async (i) => {
    const bkgReq: VoucherGroupRequest = {
      name: `test ${i}`,
      ...address,
      activeStartDate: '2000-01-02T00:00:00Z',
      activeEndDate: '2000-01-03T00:00:00Z',
      balance: {
        amount: 100,
        currency: 'EUR',
        precision: 2,
      },
      amount: 4,
    };
    const params = VoucherGroupService.asVoucherGroupParams(bkgReq);
    const { voucherGroup } = await VoucherGroupService.createVoucherGroup(params);
    bkgIds[voucherGroup.id - 1] = voucherGroup.id;
    paramss[voucherGroup.id - 1] = params;
  }));
  return { paramss, bkgIds };
}

describe('VoucherGroupService', async (): Promise<void> => {
  let ctx: {
    connection: DataSource,
    clock: Sinon.SinonFakeTimers
  };

  beforeEach(async () => {
    const clock = Sinon.useFakeTimers({ now: new Date('2000-01-01T00:00:00Z') });
    // initialize test database
    const connection = await Database.initialize();
    await truncateAllTables(connection);

    // initialize context
    ctx = {
      connection,
      clock,
    };
  });

  // close database connection
  afterEach(async () => {
    await finishTestDB(ctx.connection);
    ctx.clock.restore();
  });

  describe('validate voucher group', () => {
    it('should return true when the voucher is valid', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.true;
    });
    it('should return false when the voucher has an invalid name', async () => {
      const req: VoucherGroupRequest = {
        name: '',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.false;
    });
    it('should return false when the voucher has an invalid startDate', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: 'aasdfasd',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(params.activeStartDate.valueOf()).to.NaN;
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.false;
    });
    it('should return false when the voucher has an invalid endDate', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: 'asdafasd',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.false;
    });
    it('should return false when the voucher endDate is before startDate', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-03T00:00:00Z',
        activeEndDate: '2000-01-01T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.false;
    });
    it('should return false when the voucher endDate is in the past', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '1999-12-31T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.false;
    });
    it('should return false when the voucher has an invalid balance', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 0,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.false;
    });
    it('should return false when the voucher has an invalid amount of users', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 0,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.false;
    });
    (['addressee', 'street', 'postalCode', 'city', 'country'] as const).forEach((field) => {
      it(`should return false when the voucher has a blank ${field}`, async () => {
        const req: VoucherGroupRequest = {
          name: 'test',
          ...address,
          [field]: '  ',
          activeStartDate: '2000-01-02T00:00:00Z',
          activeEndDate: '2000-01-03T00:00:00Z',
          balance: {
            amount: 100,
            currency: 'EUR',
            precision: 2,
          },
          amount: 4,
        };
        const params = VoucherGroupService.asVoucherGroupParams(req);
        expect(VoucherGroupService.validateVoucherGroup(params)).to.be.false;
      });
    });
    it('should return true when the voucher has no attention line', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        attention: undefined,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.true;
      expect(params.attention).to.equal('');
    });
    it('should return false when the voucher has an invalid invoice date', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        invoiceDate: 'not a date',
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.false;
    });
    it('should reject an invoice date that does not exist', async () => {
      expect(VoucherGroupService.isValidInvoiceDate(VoucherGroupService.asInvoiceDate('2026-02-30'))).to.be.false;
      expect(VoucherGroupService.isValidInvoiceDate(VoucherGroupService.asInvoiceDate('15-12-1999'))).to.be.false;
      expect(VoucherGroupService.isValidInvoiceDate(VoucherGroupService.asInvoiceDate(undefined))).to.be.true;
    });
    it('should parse the invoice date to 12:00 UTC on the given day', async () => {
      const params = VoucherGroupService.asVoucherGroupParams({
        name: 'test',
        ...address,
        invoiceDate: '1999-12-15T13:37:00',
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      });
      expect(params.invoiceDate.toISOString()).to.equal('1999-12-15T12:00:00.000Z');
      expect(VoucherGroupService.validateVoucherGroup(params)).to.be.true;
    });
  });

  describe('create voucher group', () => {
    it('should create a voucher group with inactive members', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup, users } = await VoucherGroupService.createVoucherGroup(params);
      bkgEq(params, voucherGroup, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user inactive').to.equal(false);
        expect(user.tosRequired).to.equal(false);
        const transfers = await Transfer.find({ where: { toId: user.id } });
        const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(params.balance.getAmount());
      }));
    });
    it('should create a voucher group with active members', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '1999-12-31T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup, users } = await VoucherGroupService.createVoucherGroup(params);
      bkgEq(params, voucherGroup, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user active').to.equal(true);
        const transfers = await Transfer.find({ where: { toId: user.id } });
        const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(params.balance.getAmount());
      }));
    });
    it('should default the invoice date to today', async () => {
      const params = VoucherGroupService.asVoucherGroupParams({
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      });
      const { voucherGroup } = await VoucherGroupService.createVoucherGroup(params);
      const now = new Date();
      const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 12));
      expect(voucherGroup.invoiceDate.toISOString()).to.equal(today.toISOString());
    });
    it('should store the given invoice date', async () => {
      const params = VoucherGroupService.asVoucherGroupParams({
        name: 'test',
        ...address,
        invoiceDate: '1999-12-15',
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      });
      const { voucherGroup, users } = await VoucherGroupService.createVoucherGroup(params);
      bkgEq(params, voucherGroup, users);
      const stored = await VoucherGroup.findOne({ where: { id: voucherGroup.id } });
      expect(stored.invoiceDate.toISOString()).to.equal(params.invoiceDate.toISOString());
    });
  });

  describe('update voucher group', () => {
    let bkgId: number;
    beforeEach(async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup } = await VoucherGroupService.createVoucherGroup(params);
      bkgId = voucherGroup.id;
    });

    it('should update an existing voucher groups name', async () => {
      const req: VoucherGroupRequest = {
        name: 'newTest',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup, users } = await VoucherGroupService.updateVoucherGroup(bkgId, params);
      bkgEq(params, voucherGroup, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user inactive').to.equal(false);
        const transfers = await Transfer.find({ where: { toId: user.id } });
        const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(params.balance.getAmount());
      }));
    });

    it('should update the invoice date, and keep it when omitted', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        invoiceDate: '1999-12-15',
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup } = await VoucherGroupService.updateVoucherGroup(bkgId, params);
      expect(voucherGroup.invoiceDate.toISOString()).to.equal(params.invoiceDate.toISOString());

      const { invoiceDate, ...withoutInvoiceDate } = req;
      const result = await VoucherGroupService.updateVoucherGroup(
        bkgId, VoucherGroupService.asVoucherGroupParams(withoutInvoiceDate),
      );
      expect(result.voucherGroup.invoiceDate.toISOString()).to.equal(params.invoiceDate.toISOString());
    });

    it('should update an existing voucher groups active start date', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-03T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup, users } = await VoucherGroupService.updateVoucherGroup(bkgId, params);
      bkgEq(params, voucherGroup, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user inactive').to.equal(false);
        const transfers = await Transfer.find({ where: { toId: user.id } });
        const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(params.balance.getAmount());
      }));
    });

    it('should update an existing voucher groups active end date', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-04T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup, users } = await VoucherGroupService.updateVoucherGroup(bkgId, params);
      bkgEq(params, voucherGroup, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user inactive').to.equal(false);
        const transfers = await Transfer.find({ where: { toId: user.id } });
        const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(params.balance.getAmount());
      }));
    });

    it('should update an existing voucher groups passed active start date', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '1999-12-31T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup, users } = await VoucherGroupService.updateVoucherGroup(bkgId, params);
      bkgEq(params, voucherGroup, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user active').to.equal(true);
        const transfers = await Transfer.find({ where: { toId: user.id } });
        const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(params.balance.getAmount());
      }));
    });

    it('should update an existing voucher groups increased user amount', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 100,
          currency: 'EUR',
          precision: 2,
        },
        amount: 5,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup, users } = await VoucherGroupService.updateVoucherGroup(bkgId, params);
      bkgEq(params, voucherGroup, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user active').to.equal(false);
        const transfers = await Transfer.find({ where: { toId: user.id } });
        const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(params.balance.getAmount());
      }));
    });

    it('should update an existing voucher groups increased balance', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 120,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup, users } = await VoucherGroupService.updateVoucherGroup(bkgId, params);
      bkgEq(params, voucherGroup, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user active').to.equal(false);
        const transfers = await Transfer.find({ where: { toId: user.id } });
        const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(params.balance.getAmount());
      }));
    });

    it('should update an existing voucher groups decreased balance', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 80,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const { voucherGroup, users } = await VoucherGroupService.updateVoucherGroup(bkgId, params);
      bkgEq(params, voucherGroup, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user active').to.equal(false);
        const transfersPos = await Transfer.find({ where: { toId: user.id } });
        const transfersNeg = await Transfer.find({ where: { fromId: user.id } });
        const balanceAmounts = [
          ...transfersPos.map((transfer) => transfer.amountInclVat.getAmount()),
          ...transfersNeg.map((transfer) => -transfer.amountInclVat.getAmount()),
        ];
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(params.balance.getAmount());
      }));
    });

    it('should return undefined when given an invalid id', async () => {
      const req: VoucherGroupRequest = {
        name: 'test',
        ...address,
        activeStartDate: '2000-01-02T00:00:00Z',
        activeEndDate: '2000-01-03T00:00:00Z',
        balance: {
          amount: 80,
          currency: 'EUR',
          precision: 2,
        },
        amount: 4,
      };
      const params = VoucherGroupService.asVoucherGroupParams(req);
      const result = await VoucherGroupService.updateVoucherGroup(bkgId + 1, params);
      expect(result).to.be.undefined;
    });
  });

  describe('get voucher groups', () => {
    let paramss: VoucherGroupParams[];
    let bkgIds: number[];
    beforeEach(async () => {
      const bkgs = await seedVoucherGroups();
      paramss = bkgs.paramss;
      bkgIds = bkgs.bkgIds;
    });

    it('should get an voucher group by id', async () => {
      const [bkgs] = await VoucherGroupService.getVoucherGroups({ bkgId: bkgIds[0] });
      const bkg = bkgs[0];
      const users = bkg.vouchers.map((v) => v.user);
      bkgEq(paramss[0], bkg, users);
      await Promise.all(users.map(async (user) => {
        expect(user.active, 'user inactive').to.equal(false);
        const transfers = await Transfer.find({ where: { toId: user.id } });
        const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
        const balance = balanceAmounts.reduce((a, b) => a + b);
        expect(balance, 'correct transfers').to.equal(paramss[0].balance.getAmount());
      }));
    });

    it('should return undefined when given a wrong id', async () => {
      const [bkgs] = await VoucherGroupService.getVoucherGroups({ bkgId: bkgIds.length + 1 });
      expect(bkgs[0]).to.be.undefined;
    });

    it('should get all voucher groups', async () => {
      const [bkgs] = await VoucherGroupService.getVoucherGroups({});
      await Promise.all(bkgs.map(async (bkg) => {
        const users = bkg.vouchers.map((v) => v.user);
        bkgEq(paramss[bkg.id - 1], bkg, users);
        await Promise.all(users.map(async (user) => {
          expect(user.active, 'user inactive').to.equal(false);
          const transfers = await Transfer.find({ where: { toId: user.id } });
          const balanceAmounts = transfers.map((transfer) => transfer.amountInclVat.getAmount());
          const balance = balanceAmounts.reduce((a, b) => a + b);
          expect(balance, 'correct transfers').to.equal(paramss[bkg.id - 1].balance.getAmount());
        }));
      }));
    });
  });

  describe('update voucher group address', () => {
    it('should only update the address and leave balances untouched', async () => {
      const { bkgIds, paramss } = await seedVoucherGroups();
      const newAddress = {
        addressee: 'New purchaser',
        street: 'Other street 1',
        postalCode: '1234 AB',
        city: 'Utrecht',
        country: 'Netherlands',
      };

      const result = await VoucherGroupService.updateVoucherGroupAddress(bkgIds[0], newAddress);

      expect(result.voucherGroup.addressee).to.equal(newAddress.addressee);
      expect(result.voucherGroup.attention).to.equal('');
      expect(result.voucherGroup.city).to.equal(newAddress.city);
      expect(result.voucherGroup.balance.getAmount()).to.equal(paramss[0].balance.getAmount());
      expect(result.users).to.be.of.length(paramss[0].amount);
      const transfers = await Transfer.find({ where: { toId: result.users[0].id } });
      expect(transfers).to.be.of.length(1);
    });

    it('should update the invoice date when given', async () => {
      const { bkgIds } = await seedVoucherGroups();
      const invoiceDate = new Date('1999-12-15T12:00:00Z');

      const result = await VoucherGroupService.updateVoucherGroupAddress(bkgIds[0], address, invoiceDate);

      expect(result.voucherGroup.invoiceDate.toISOString()).to.equal(invoiceDate.toISOString());
    });

    it('should return undefined when given an invalid id', async () => {
      const result = await VoucherGroupService.updateVoucherGroupAddress(999, address);
      expect(result).to.be.undefined;
    });
  });
});
