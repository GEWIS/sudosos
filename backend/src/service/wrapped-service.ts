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
import { EntityManager, EntityTarget, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import WrappedResponse from '../controller/response/wrapped-response';
import WithManager from '../database/with-manager';
import Wrapped from '../entity/wrapped';
import User from '../entity/user/user';
import Transaction from '../entity/transactions/transaction';
import SubTransaction from '../entity/transactions/sub-transaction';
import SubTransactionRow from '../entity/transactions/sub-transaction-row';
import ProductRevision from '../entity/product/product-revision';
import OrganMembership from '../entity/organ/organ-membership';
import WrappedOrganMember from '../entity/wrapped/wrapped-organ-member';
import PointOfSale from '../entity/point-of-sale/point-of-sale';
import Config from '../config';
import { utcToDate } from '../helpers/timestamps';

export interface UpdateWrappedParameters {
  ids?: number[],
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const INSERT_CHUNK_SIZE = 250;

/**
 * A Wrapped day runs from 06:00 to 06:00, so a night out counts as a single day.
 */
export const DAY_START_HOUR = 6;

interface Period {
  year: number;
  start: Date;
  end: Date;
  days: number;
}

interface Statistics {
  transactionCount: number;
  totalSpent: number;
  heatmap: number[];
}

interface Seller {
  sellerId: number;
  transactionCount: number;
  turnover: number;
}

const isEligible = (alias: string) => `${alias}.deleted = 0 AND ${alias}.active = 1 AND ${alias}.extensiveDataProcessing = 1`;

/**
 * Computes the yearly "Wrapped" statistics of users.
 */
export default class WrappedService extends WithManager {
  public async getWrappedForUser(userId: number): Promise<Wrapped | null> {
    return this.manager.findOne(Wrapped, {
      where: { userId },
      relations: { organs: true },
    });
  }

  public static asWrappedResponse(data: Wrapped): WrappedResponse {
    return {
      userId: data.userId,
      transactions: {
        transactionCount: data.transactionCount,
        transactionPercentile: data.transactionPercentile,
        transactionMaxDate: data.transactionMaxDate?.toISOString(),
        transactionMaxAmount: data.transactionMaxAmount,
        transactionHeatmap: data.transactionHeatmap,
      },
      spentPercentile: data.spentPercentile,
      syncedFrom: data.syncedFrom.toISOString(),
      syncedTo: data.syncedTo.toISOString(),
      organs: (data.organs ?? []).map((organ) => ({
        organId: organ.organId,
        ordinalTransactionCreated: organ.ordinalTransactionCreated,
        ordinalTurnoverCreated: organ.ordinalTurnoverCreated,
      })),
    };
  }

  /**
   * Recompute the Wrapped of all eligible users, or only of the users in `params.ids`.
   * Percentiles and seller rankings are always relative to all eligible users.
   */
  public async updateWrapped(params: UpdateWrappedParameters = {}): Promise<void> {
    const ids = params.ids?.length ? params.ids : undefined;
    const period = WrappedService.getPeriod(Config.get().wrapped.year);

    await this.manager.transaction(async (manager) => {
      const service = new WrappedService(manager);
      const rows = await service.computeWrapped(period, ids);
      const organMembers = await service.computeOrganMembers(period, ids);

      await WrappedService.deleteRows(manager, WrappedOrganMember, ids);
      await WrappedService.deleteRows(manager, Wrapped, ids);
      await WrappedService.insertRows(manager, Wrapped, rows);
      await WrappedService.insertRows(manager, WrappedOrganMember, organMembers);
    });
  }

  private async computeWrapped(period: Period, ids?: number[]): Promise<Wrapped[]> {
    const statistics = new Map<number, Statistics>();
    for (const userId of await this.getEligibleUserIds(ids)) {
      statistics.set(userId, { transactionCount: 0, totalSpent: 0, heatmap: new Array(period.days).fill(0) });
    }

    for (const purchase of await this.getPurchases(period, ids)) {
      const stats = statistics.get(purchase.userId);
      stats.transactionCount += 1;
      stats.totalSpent += purchase.total;
      stats.heatmap[WrappedService.dayOf(purchase.createdAt, period)] += 1;
    }

    const population = ids
      ? await this.getPopulation(period)
      : [...statistics].map(([userId, stats]) => ({ userId, ...stats })).filter((p) => p.transactionCount > 0);
    const transactionPercentiles = WrappedService.computePercentiles(
      new Map(population.map((p) => [p.userId, p.transactionCount])),
    );
    const spentPercentiles = WrappedService.computePercentiles(
      new Map(population.map((p) => [p.userId, p.totalSpent])),
    );

    const syncedTo = new Date();
    return [...statistics].map(([userId, stats]) => {
      const transactionMaxAmount = Math.max(...stats.heatmap);
      return Object.assign(new Wrapped(), {
        userId,
        transactionCount: stats.transactionCount,
        transactionPercentile: transactionPercentiles.get(userId) ?? 100,
        transactionMaxDate: transactionMaxAmount > 0
          ? new Date(period.year, 0, 1 + stats.heatmap.indexOf(transactionMaxAmount))
          : null,
        transactionMaxAmount,
        transactionHeatmap: stats.heatmap,
        spentPercentile: spentPercentiles.get(userId) ?? 100,
        syncedFrom: period.start,
        syncedTo,
      });
    });
  }

  private static getPeriod(year: number): Period {
    return {
      year,
      start: new Date(year, 0, 1, DAY_START_HOUR),
      end: new Date(year + 1, 0, 1, DAY_START_HOUR),
      days: (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / DAY_MS,
    };
  }

  /**
   * Zero-based day of the Wrapped year a moment belongs to.
   */
  private static dayOf(date: Date, period: Period): number {
    const day = new Date(date.getTime() - DAY_START_HOUR * HOUR_MS);
    return (Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) - Date.UTC(period.year, 0, 1)) / DAY_MS;
  }

  /**
   * The top percentage each value falls in: 10 means only 10% of the values are at least as high.
   */
  private static computePercentiles(values: Map<number, number>): Map<number, number> {
    const sorted = [...values.values()].sort((a, b) => a - b);
    const lowerCount = new Map<number, number>();
    sorted.forEach((value, index) => {
      if (!lowerCount.has(value)) lowerCount.set(value, index);
    });

    return new Map([...values].map(([id, value]) => (
      [id, Number((100 * (1 - lowerCount.get(value) / sorted.length)).toFixed(2))]
    )));
  }

  private async getEligibleUserIds(ids?: number[]): Promise<number[]> {
    const query = this.manager.createQueryBuilder(User, 'user')
      .select('user.id', 'id')
      .where(isEligible('user'));
    if (ids) query.andWhere('user.id IN (:...ids)', { ids });

    return (await query.getRawMany<{ id: number }>()).map((user) => user.id);
  }

  /**
   * Query over the product rows eligible users bought within the period.
   */
  private purchaseRows(period: Period): SelectQueryBuilder<Transaction> {
    return this.manager.createQueryBuilder(Transaction, 't')
      .innerJoin(User, 'buyer', `buyer.id = t.fromId AND ${isEligible('buyer')}`)
      .innerJoin(SubTransaction, 'st', 'st.transactionId = t.id')
      .innerJoin(SubTransactionRow, 'str', 'str.subTransactionId = st.id')
      .innerJoin(ProductRevision, 'pr', 'pr.productId = str.productProductId AND pr.revision = str.productRevision')
      .where('t.createdAt >= :start AND t.createdAt < :end', { start: period.start, end: period.end });
  }

  private async getPurchases(period: Period, ids?: number[]) {
    const query = this.purchaseRows(period)
      .select('t.fromId', 'userId')
      .addSelect('t.createdAt', 'createdAt')
      .addSelect('SUM(str.amount * pr.priceInclVat)', 'total')
      .groupBy('t.id')
      .addGroupBy('t.fromId')
      .addGroupBy('t.createdAt');
    if (ids) query.andWhere('t.fromId IN (:...ids)', { ids });

    const purchases = await query.getRawMany<{ userId: number, createdAt: string | Date, total: string }>();
    return purchases.map((purchase) => ({
      userId: purchase.userId,
      createdAt: utcToDate(purchase.createdAt),
      total: Number(purchase.total),
    }));
  }

  private async getPopulation(period: Period) {
    const population = await this.purchaseRows(period)
      .select('t.fromId', 'userId')
      .addSelect('COUNT(DISTINCT t.id)', 'transactionCount')
      .addSelect('SUM(str.amount * pr.priceInclVat)', 'totalSpent')
      .groupBy('t.fromId')
      .getRawMany<{ userId: number, transactionCount: string, totalSpent: string }>();

    return population.map((user) => ({
      userId: user.userId,
      transactionCount: Number(user.transactionCount),
      totalSpent: Number(user.totalSpent),
    }));
  }

  /**
   * Rank each organ member among everyone who rang up transactions at the points of sale of their organ.
   */
  private async computeOrganMembers(period: Period, ids?: number[]): Promise<WrappedOrganMember[]> {
    const membershipQuery = this.manager.createQueryBuilder(OrganMembership, 'membership')
      .select('membership.userId', 'userId')
      .addSelect('membership.organId', 'organId');
    if (ids) membershipQuery.where('membership.userId IN (:...ids)', { ids });
    const memberships = await membershipQuery.getRawMany<{ userId: number, organId: number }>();
    if (memberships.length === 0) return [];

    const sales = await this.manager.createQueryBuilder(Transaction, 't')
      .select('pos.ownerId', 'organId')
      .addSelect('t.createdById', 'sellerId')
      .addSelect('COUNT(DISTINCT t.id)', 'transactionCount')
      .addSelect('SUM(str.amount * pr.priceInclVat)', 'turnover')
      .innerJoin(PointOfSale, 'pos', 'pos.id = t.pointOfSalePointOfSaleId')
      .innerJoin(User, 'organ', 'organ.id = pos.ownerId AND organ.active = 1')
      .innerJoin(User, 'seller', `seller.id = t.createdById AND ${isEligible('seller')}`)
      .innerJoin(SubTransaction, 'st', 'st.transactionId = t.id')
      .innerJoin(SubTransactionRow, 'str', 'str.subTransactionId = st.id')
      .innerJoin(ProductRevision, 'pr', 'pr.productId = str.productProductId AND pr.revision = str.productRevision')
      .where('t.createdAt >= :start AND t.createdAt < :end', { start: period.start, end: period.end })
      .andWhere('pos.ownerId IN (:...organIds)', { organIds: [...new Set(memberships.map((m) => m.organId))] })
      .groupBy('pos.ownerId')
      .addGroupBy('t.createdById')
      .getRawMany<{ organId: number, sellerId: number, transactionCount: string, turnover: string }>();

    const sellersByOrgan = new Map<number, Seller[]>();
    for (const sale of sales) {
      const sellers = sellersByOrgan.get(sale.organId) ?? [];
      sellers.push({
        sellerId: sale.sellerId,
        transactionCount: Number(sale.transactionCount),
        turnover: Number(sale.turnover),
      });
      sellersByOrgan.set(sale.organId, sellers);
    }

    const ordinals = (sellers: Seller[], key: 'transactionCount' | 'turnover') => new Map(
      [...sellers]
        .sort((a, b) => b[key] - a[key] || a.sellerId - b.sellerId)
        .map((seller, ordinal) => [seller.sellerId, ordinal]),
    );
    const rankings = new Map([...sellersByOrgan].map(([organId, sellers]) => (
      [organId, { transactions: ordinals(sellers, 'transactionCount'), turnover: ordinals(sellers, 'turnover') }]
    )));

    return memberships
      .filter(({ userId, organId }) => rankings.get(organId)?.turnover.has(userId))
      .map(({ userId, organId }) => Object.assign(new WrappedOrganMember(), {
        userId,
        organId,
        ordinalTransactionCreated: rankings.get(organId).transactions.get(userId),
        ordinalTurnoverCreated: rankings.get(organId).turnover.get(userId),
      }));
  }

  private static async deleteRows(manager: EntityManager, entity: EntityTarget<ObjectLiteral>, ids?: number[]) {
    const query = manager.createQueryBuilder().delete().from(entity);
    if (ids) query.where('userId IN (:...ids)', { ids });
    await query.execute();
  }

  private static async insertRows<T extends ObjectLiteral>(manager: EntityManager, entity: EntityTarget<T>, rows: T[]) {
    for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
      await manager.insert(entity, rows.slice(i, i + INSERT_CHUNK_SIZE));
    }
  }
}
