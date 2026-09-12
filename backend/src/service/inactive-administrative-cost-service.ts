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

import WithManager from '../database/with-manager';
import UserService from './user-service';
import { FindManyOptions, FindOptionsRelations, In } from 'typeorm';
import InactiveAdministrativeCost from '../entity/transactions/inactive-administrative-cost';
import QueryFilter, { FilterMapping } from '../helpers/query-filter';
import User, { EligibleInactiveUsers } from '../entity/user/user';
import BalanceService from './balance-service';
import TransferService from './transfer-service';
import {
  CreateInactiveAdministrativeCostRequest,
  HandoutInactiveAdministrativeCostsRequest,
} from '../controller/request/inactive-administrative-cost-request';
import TransferRequest from '../controller/request/transfer-request';
import dinero, { Dinero } from 'dinero.js';
import { DineroObjectRequest } from '../controller/request/dinero-request';
import Transfer from '../entity/transactions/transfer';
import Transaction from '../entity/transactions/transaction';
import { RequestWithToken } from '../middleware/token-middleware';
import { asBoolean, asNumber } from '../helpers/validators';
import { PaginationParameters } from '../helpers/pagination';
import {
  InactiveAdministrativeCostResponse,
  UserToInactiveAdministrativeCostResponse,
} from '../controller/response/inactive-administrative-cost-response';
import { parseUserToBaseResponse } from '../helpers/revision-to-response';
import ServerSettingsStore from '../server-settings/server-settings-store';
import { ISettings } from '../entity/server-setting';
import Notifier from '../notifications';
import { NotificationTypes } from '../notifications/notification-types';
import {
  InactiveAdministrativeCostNotificationOptions,
  UserGotInactiveAdministrativeCostOptions,
} from '../notifications/notification-options';
import { InactiveAdministrativeCostReport } from '../entity/report/inactive-administrative-cost-report';
import VatGroup from '../entity/vat-group';

const ADMINISTRATIVE_COST_NOTIFY_YEARS = 2;
const ADMINISTRATIVE_COST_HANDOUT_YEARS = 3;

export interface InactiveAdministrativeCostFilterParameters {
  /**
   * Filter based on user id
   */
  fromId?: number;

  /**
   * Filter based on inactive administrative cost id
   */
  inactiveAdministrativeCostId?: number;

  /**
   * Filter on notification or fine
   */
  notification?: boolean;
}

export function parseInactiveAdministrativeCostFilterParameters(req: RequestWithToken): InactiveAdministrativeCostFilterParameters {
  return {
    fromId: asNumber(req.query.fromId),
    inactiveAdministrativeCostId: asNumber(req.query.inactiveAdministrativeCostId),
    notification: asBoolean(req.query.notification),
  };
}

export default class InactiveAdministrativeCostService extends WithManager {

  // Number of whole calendar years between the given date and now.
  private static yearDifference(date: Date): number {
    const now = new Date();
    let years = now.getFullYear() - date.getFullYear();

    const anniversary = new Date(date);
    anniversary.setFullYear(date.getFullYear() + years);
    if (anniversary > now) years -= 1;

    return years;
  }

  private static getAdministrativeCostValue(): number {
    return ServerSettingsStore.getInstance().getSetting('administrativeCostValue') as ISettings['administrativeCostValue'];
  }

  /**
   * Determines the amount that would actually be deducted from the given user for an
   * inactive administrative cost: the configured administrative cost value, capped to the
   * user's balance, and never negative.
   * @param currentBalance - The user's current balance.
   */
  private getDeductionAmount(currentBalance: Dinero): number {
    const administrativeCostValue = InactiveAdministrativeCostService.getAdministrativeCostValue();
    const balanceAmount = currentBalance.getAmount();

    return balanceAmount > 0
      ? Math.min(balanceAmount, administrativeCostValue)
      : 0;
  }

  private async lastTransferQuery(userId: number): Promise<Transfer | null> {
    return Transfer.getRepository()
      .createQueryBuilder('transfer')
      .leftJoin(InactiveAdministrativeCost, 'inactiveAdministrativeCost', 'inactiveAdministrativeCost.transferId = transfer.id')
      .where('inactiveAdministrativeCost.id IS NULL')
      .andWhere('(transfer.fromId = :userId OR transfer.toId = :userId)', { userId })
      .orderBy('transfer.createdAt', 'DESC')
      .limit(1)
      .getOne();
  }

  private async lastTransactionQuery(userId: number): Promise<Transaction | null> {
    return Transaction.getRepository()
      .createQueryBuilder('transaction')
      .where('transaction.fromId = :userId', { userId })
      .orderBy('transaction.createdAt', 'DESC')
      .limit(1)
      .getOne();
  }

  public static toArrayResponse(inactiveAdministrativeCosts: InactiveAdministrativeCost[]): InactiveAdministrativeCostResponse[] {
    return inactiveAdministrativeCosts.map(inactiveAdministrativeCost => inactiveAdministrativeCost.toResponse());
  }

  /**
   * Years since the user's most recent transfer or transaction. Inactive administrative
   * cost transfers do not count as activity. Returns null if the user has no activity.
   * @param userId
   */
  private async yearsSinceLastActivity(userId: number): Promise<number | null> {
    const [lastTransfer, lastTransaction] = await Promise.all([
      this.lastTransferQuery(userId),
      this.lastTransactionQuery(userId),
    ]);

    const activityYears = [lastTransfer, lastTransaction]
      .filter((activity) => activity != null)
      .map((activity) => InactiveAdministrativeCostService.yearDifference(activity.createdAt));

    return activityYears.length > 0 ? Math.min(...activityYears) : null;
  }

  /**
   * Whether the user should be notified of upcoming administrative costs: inactive for at
   * least ADMINISTRATIVE_COST_NOTIFY_YEARS, but not yet long enough for a handout.
   * @param userId
   */
  private async isEligibleForNotification(userId: number): Promise<boolean> {
    const years = await this.yearsSinceLastActivity(userId);
    return years != null && years >= ADMINISTRATIVE_COST_NOTIFY_YEARS && years < ADMINISTRATIVE_COST_HANDOUT_YEARS;
  }

  /**
   * Whether administrative costs should be handed out to the user: inactive for at least
   * ADMINISTRATIVE_COST_HANDOUT_YEARS.
   * @param userId
   */
  private async isEligibleForHandout(userId: number): Promise<boolean> {
    const years = await this.yearsSinceLastActivity(userId);
    return years != null && years >= ADMINISTRATIVE_COST_HANDOUT_YEARS;
  }

  /**
   * Checks which users are eligible for either a notification or a fine.
   * @param params
   */
  public async checkInactiveUsers(params: InactiveAdministrativeCostFilterParameters)
    : Promise<UserToInactiveAdministrativeCostResponse[]> {
    const { notification } = params;

    const users = await User.find({
      where: { type: In(EligibleInactiveUsers), deleted: false },
    });
    const eligibleUserIds: number[] = [];

    // First, collect all users eligible based on date criteria and notification status
    for (const user of users) {
      if (notification && user.inactiveNotificationSend) continue;

      const isEligible = notification
        ? await this.isEligibleForNotification(user.id)
        : await this.isEligibleForHandout(user.id);

      if (isEligible) {
        eligibleUserIds.push(user.id);
      }
    }

    // Then, get balances for all eligible users in a single query
    if (eligibleUserIds.length === 0) {
      return [];
    }

    const [balanceRecords] = await new BalanceService(this.manager).getBalances({ ids: eligibleUserIds });
    const eligibleUsersWithPositiveBalance = balanceRecords
      .filter(balance => balance.amount.amount > 0)
      .map(balance => balance.id);

    if (eligibleUsersWithPositiveBalance.length === 0) {
      return [];
    }

    const mapped = await User.find(UserService.getOptions({ id: eligibleUsersWithPositiveBalance }));
    return mapped.map(user => parseUserToBaseResponse(user, false));
  }

  /**
   * Hard deletes the given InactiveAdministrativeCost and its linked Transfer.
   * @param inactiveAdministrativeCostId
   * @returns the deleted cost, or undefined when it did not exist.
   */
  public async deleteInactiveAdministrativeCost(inactiveAdministrativeCostId: number): Promise<InactiveAdministrativeCost | undefined> {
    // Find inactive administrative cost entity with transfer relation
    const inactiveAdministrativeCost = await this.manager.findOne(InactiveAdministrativeCost, { ...InactiveAdministrativeCostService.getOptions({ inactiveAdministrativeCostId }) });
    if (!inactiveAdministrativeCost) return undefined;

    // Store transfer reference before deletion
    const transfer = inactiveAdministrativeCost.transfer;

    // Delete InactiveAdministrativeCost first to clear the reference from Transfer
    await this.manager.delete(InactiveAdministrativeCost, inactiveAdministrativeCostId);

    // Delete the linked Transfer
    await this.manager.delete(Transfer, transfer.id);

    // Invalidate balance caches for affected users
    await TransferService.invalidateBalanceCaches(transfer, this.manager);
    return inactiveAdministrativeCost;
  }

  /**
   * Creates an InactiveAdministrativeCost from an InactiveAdministrativeCostRequest
   * @param inactiveAdministrativeCostRequest - The InactiveAdministrativeCost request to create
   */
  public async createInactiveAdministrativeCost(inactiveAdministrativeCostRequest: CreateInactiveAdministrativeCostRequest)
    : Promise<InactiveAdministrativeCost> {
    const { forId } = inactiveAdministrativeCostRequest;

    // Calculate reduction amount
    const user = await this.manager.findOne(User, { where: { id: forId } });
    const userBalanceResponse = await new BalanceService(this.manager).getBalance(user.id);
    const monetaryAmount = this.getDeductionAmount(dinero(userBalanceResponse.amount));

    const amount: DineroObjectRequest = {
      amount: monetaryAmount,
      currency: 'EUR',
      precision: 2,
    };

    // Create transfer request and create the linked transfer
    const transferRequest: TransferRequest = {
      amount,
      description: 'InactiveAdministrativeCost Transfer',
      fromId: forId,
      toId: 0,
    };

    const transfer = await new TransferService(this.manager).createTransfer(transferRequest);

    // Create a new inactive administrative cost
    const newInactiveAdministrativeCost: InactiveAdministrativeCost = Object.assign(new InactiveAdministrativeCost(), {
      fromId: forId,
      from: user,
      amount: dinero(amount),
      transfer: transfer,
    });

    transfer.inactiveAdministrativeCost = newInactiveAdministrativeCost;

    await this.manager.save(Transfer, transfer);
    await this.manager.save(newInactiveAdministrativeCost);

    const options = InactiveAdministrativeCostService.getOptions({ inactiveAdministrativeCostId: newInactiveAdministrativeCost.id });
    return this.manager.findOne(InactiveAdministrativeCost, options);
  }

  /**
   * Email all users with the given ids. These user will get notified that an administrative cost has been deducted from their account.
   * @param users
   */
  public async handOutInactiveAdministrativeCost(users: HandoutInactiveAdministrativeCostsRequest)
    : Promise<InactiveAdministrativeCost[]> {
    return Promise.all(users.userIds.map(async (u) => {
      const req: CreateInactiveAdministrativeCostRequest = { forId: u };

      const inactiveAdministrativeCost = await this.createInactiveAdministrativeCost(req);

      const user = await this.manager.findOne(User, { where: { id: u } });
      const balance = await new BalanceService(this.manager).getBalance(user.id);
      const currentUserBalance = dinero({ amount: balance.amount.amount });

      await Notifier.getInstance().notify({
        type: NotificationTypes.UserGotInactiveAdministrativeCost,
        userId: user.id,
        params: new UserGotInactiveAdministrativeCostOptions(
          inactiveAdministrativeCost.amount,
          currentUserBalance,
        ),
      });

      return inactiveAdministrativeCost;
    }));
  }

  /**
   * Email all users with the given ids. These users will get notified that in a year time money will be deducted from their
   * account as they have been inactive for three years.
   * @param users
   */
  public async sendInactiveNotification(users: HandoutInactiveAdministrativeCostsRequest)
    : Promise<void> {

    await Promise.all(users.userIds.map(async (u) => {
      const user = await this.manager.findOne(User, { where: { id: u } });

      const userBalanceResponse = await new BalanceService(this.manager).getBalance(user.id);
      const monetaryAmount = this.getDeductionAmount(dinero(userBalanceResponse.amount));

      user.inactiveNotificationSend = true;
      await user.save();

      const currentUserBalance = dinero({ amount: userBalanceResponse.amount.amount });

      return Notifier.getInstance().notify({
        type: NotificationTypes.InactiveAdministrativeCostNotification,
        userId: user.id,
        params: new InactiveAdministrativeCostNotificationOptions(
          dinero({ amount: monetaryAmount }),
          currentUserBalance,
        ),
      });
    }),
    );
  }

  /**
   * Returns database entities based on the given filter params
   * @param params
   */
  public async getInactiveAdministrativeCosts(params: InactiveAdministrativeCostFilterParameters = {})
    : Promise<InactiveAdministrativeCost[]> {
    const options = { ...InactiveAdministrativeCostService.getOptions(params) };
    return this.manager.find(InactiveAdministrativeCost, { ...options });
  }

  /**
   * Function that returns all inactive administrative cost entitites based on given params.
   * @param params
   * @param pagination - The pagination params to apply
   */
  public async getPaginatedInactiveAdministrativeCosts(params: InactiveAdministrativeCostFilterParameters = {},
    pagination: PaginationParameters = {}): Promise<[InactiveAdministrativeCost[], number]> {
    const { take, skip } = pagination;
    const options = { ...InactiveAdministrativeCostService.getOptions(params), skip, take };

    const inactiveAdministrativeCosts = await this.manager.find(InactiveAdministrativeCost, { ...options, take });
    const count = await this.manager.count(InactiveAdministrativeCost, options);

    return [inactiveAdministrativeCosts, count];
  }

  public static getOptions(params: InactiveAdministrativeCostFilterParameters): FindManyOptions<InactiveAdministrativeCost> {
    const filterMapping: FilterMapping = {
      fromId: 'fromId',
      inactiveAdministrativeCostId: 'id',
    };

    const relations: FindOptionsRelations<InactiveAdministrativeCost> = {
      from: true,
      transfer: { to: true },
    };

    const options: FindManyOptions<InactiveAdministrativeCost> = {
      where: {
        ...QueryFilter.createFilterWhereClause(filterMapping, params),
      },
      order: { createdAt: 'DESC' },
    };

    return { ...options, relations };
  }

  /**
   * Gets the high VAT group from server settings
   * @private
   */
  private async getHighVATGroup(): Promise<VatGroup> {
    const id = ServerSettingsStore.getInstance().getSetting('highVatGroupId') as ISettings['highVatGroupId'];
    const vatGroup = await this.manager.findOne(VatGroup, { where: { id } });
    if (vatGroup) return vatGroup;
    else throw new Error('High vat group not found');
  }

  /**
   * Gets a report of inactive administrative costs within the given date range
   * @param fromDate - The start date of the report (inclusive)
   * @param toDate - The end date of the report (exclusive)
   */
  public async getInactiveAdministrativeCostReport(fromDate: Date, toDate: Date): Promise<InactiveAdministrativeCostReport> {
    // Query all inactive administrative costs within the date range
    const costs = await this.manager.find(InactiveAdministrativeCost, {
      where: {
        createdAt: QueryFilter.createFilterWhereDate(fromDate, toDate),
      },
    });

    // Sum all amounts (these are incl. VAT)
    let totalAmountInclVat = dinero({ amount: 0, currency: 'EUR', precision: 2 });
    for (const cost of costs) {
      totalAmountInclVat = totalAmountInclVat.add(cost.amount);
    }

    // Get high VAT percentage from server settings
    const highVatGroup = await this.getHighVATGroup();
    const vatPercentage = highVatGroup.percentage;

    // Calculate base (excl VAT) from total (incl VAT) - total is the source of truth
    // Divide total by (1 + VAT percentage) to get base amount, rounded to cents
    const totalAmountInclVatAmount = totalAmountInclVat.getAmount();
    const totalAmountExclVatAmount = Math.round(totalAmountInclVatAmount / (1 + vatPercentage / 100));
    const totalAmountExclVat = dinero({ amount: totalAmountExclVatAmount, currency: 'EUR', precision: 2 });
    
    // Calculate VAT amount as the difference to ensure amounts always add up correctly
    const vatAmount = totalAmountInclVat.subtract(totalAmountExclVat);

    return new InactiveAdministrativeCostReport({
      fromDate,
      toDate,
      totalAmountInclVat,
      totalAmountExclVat,
      vatAmount,
      vatPercentage,
      count: costs.length,
    });
  }
}