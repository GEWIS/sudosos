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
import { EntityManager, EntityTarget, In, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import WrappedResponse from '../controller/response/wrapped-response';
import WithManager from '../database/with-manager';
import Wrapped, { WrappedProduct } from '../entity/wrapped';
import User from '../entity/user/user';
import Transaction from '../entity/transactions/transaction';
import SubTransaction from '../entity/transactions/sub-transaction';
import SubTransactionRow from '../entity/transactions/sub-transaction-row';
import Product from '../entity/product/product';
import ProductRevision from '../entity/product/product-revision';
import ProductCategory from '../entity/product/product-category';
import ProductImage from '../entity/file/product-image';
import OrganMembership from '../entity/organ/organ-membership';
import WrappedOrganMember from '../entity/wrapped/wrapped-organ-member';
import PointOfSale from '../entity/point-of-sale/point-of-sale';
import PointOfSaleRevision from '../entity/point-of-sale/point-of-sale-revision';
import DineroTransformer from '../entity/transformer/dinero-transformer';
import Config from '../config';
import { utcToDate } from '../helpers/timestamps';

export interface UpdateWrappedParameters {
  ids?: number[],
  year?: number,
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const INSERT_CHUNK_SIZE = 250;
const TOP_PRODUCT_COUNT = 5;

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

interface ProductPurchase {
  userId: number;
  productId: number;
  categoryId: number;
  count: number;
  total: number;
}

interface Statistics {
  transactionCount: number;
  totalSpent: number;
  borrelSpent: number;
  heatmap: number[];
  products: Map<number, { count: number, total: number }>;
  categories: Map<number, number>;
}

interface Seller {
  sellerId: number;
  transactionCount: number;
  turnover: number;
}

const isEligible = (alias: string) => `${alias}.deleted = 0 AND ${alias}.active = 1 AND ${alias}.extensiveDataProcessing = 1`;

const toDinero = (amount: number) => DineroTransformer.Instance.from(amount);

/**
 * Computes the yearly "Wrapped" statistics of users.
 */
export default class WrappedService extends WithManager {
  /**
   * Wrapped is about the current year, except in January, when it is about the year that just ended.
   */
  public static currentYear(now = new Date()): number {
    return Config.get().wrapped.year ?? (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());
  }

  /**
   * Get the Wrapped of a user for the given year, or their most recent one.
   */
  public async getWrappedForUser(userId: number, year?: number): Promise<Wrapped | null> {
    return this.manager.findOne(Wrapped, {
      where: { userId, year },
      order: { year: 'DESC' },
      relations: { organs: true },
    });
  }

  /**
   * Get the current Wrapped of a user, computing it when it does not exist yet.
   * Returns null for users that cannot have a Wrapped.
   */
  public async ensureWrappedForUser(userId: number): Promise<Wrapped | null> {
    const year = WrappedService.currentYear();
    const existing = await this.getWrappedForUser(userId, year);
    if (existing) return existing;

    await this.updateWrapped({ ids: [userId], year });
    return this.getWrappedForUser(userId, year);
  }

  public static asWrappedResponse(data: Wrapped): WrappedResponse {
    return {
      userId: data.userId,
      year: data.year,
      transactions: {
        transactionCount: data.transactionCount,
        previousTransactionCount: data.previousTransactionCount,
        transactionPercentile: data.transactionPercentile,
        transactionMaxDate: data.transactionMaxDate?.toISOString(),
        transactionMaxAmount: data.transactionMaxAmount,
        transactionHeatmap: data.transactionHeatmap,
      },
      totalSpent: data.totalSpent.toObject(),
      previousTotalSpent: data.previousTotalSpent.toObject(),
      borrelSpent: data.borrelSpent.toObject(),
      spentPercentile: data.spentPercentile,
      topProducts: data.topProducts.map((product) => ({
        ...product,
        totalInclVat: toDinero(product.totalInclVat).toObject(),
      })),
      categories: data.categories.map((category) => ({
        ...category,
        totalInclVat: toDinero(category.totalInclVat).toObject(),
      })),
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
    const period = WrappedService.getPeriod(params.year ?? WrappedService.currentYear());
    const scope = { year: period.year, ...(ids && { userId: In(ids) }) };

    await this.manager.transaction(async (manager) => {
      const service = new WrappedService(manager);
      const rows = await service.computeWrapped(period, ids);
      const organMembers = await service.computeOrganMembers(period, ids);

      await manager.delete(WrappedOrganMember, scope);
      await manager.delete(Wrapped, scope);
      await WrappedService.insertRows(manager, Wrapped, rows);
      await WrappedService.insertRows(manager, WrappedOrganMember, organMembers);
    });
  }

  private async computeWrapped(period: Period, ids?: number[]): Promise<Wrapped[]> {
    const statistics = new Map<number, Statistics>();
    for (const userId of await this.getEligibleUserIds(ids)) {
      statistics.set(userId, {
        transactionCount: 0,
        totalSpent: 0,
        borrelSpent: 0,
        heatmap: new Array(period.days).fill(0),
        products: new Map(),
        categories: new Map(),
      });
    }

    for (const purchase of await this.getPurchases(period, ids)) {
      const stats = statistics.get(purchase.userId);
      stats.transactionCount += 1;
      stats.totalSpent += purchase.total;
      if (!purchase.selfService) stats.borrelSpent += purchase.total;
      stats.heatmap[WrappedService.dayOf(purchase.createdAt, period)] += 1;
    }

    const productPurchases = await this.getProductPurchases(period, ids);
    for (const purchase of productPurchases) {
      const stats = statistics.get(purchase.userId);
      const product = stats.products.get(purchase.productId) ?? { count: 0, total: 0 };
      stats.products.set(purchase.productId, {
        count: product.count + purchase.count,
        total: product.total + purchase.total,
      });
      stats.categories.set(purchase.categoryId, (stats.categories.get(purchase.categoryId) ?? 0) + purchase.total);
    }

    const totals = ids
      ? await this.getTotals(period)
      : [...statistics].map(([userId, stats]) => ({ userId, ...stats })).filter((p) => p.transactionCount > 0);
    const transactionPercentiles = WrappedService.computePercentiles(
      new Map(totals.map((p) => [p.userId, p.transactionCount])),
    );
    const spentPercentiles = WrappedService.computePercentiles(
      new Map(totals.map((p) => [p.userId, p.totalSpent])),
    );
    const previousTotals = new Map(
      (await this.getTotals(WrappedService.getPeriod(period.year - 1), ids)).map((p) => [p.userId, p]),
    );

    const topProducts = await this.computeTopProducts(period, statistics, productPurchases, ids);
    const categoryNames = await this.getCategoryNames();

    const syncedTo = new Date();
    return [...statistics].map(([userId, stats]) => {
      const transactionMaxAmount = Math.max(...stats.heatmap);
      return Object.assign(new Wrapped(), {
        userId,
        year: period.year,
        transactionCount: stats.transactionCount,
        previousTransactionCount: previousTotals.get(userId)?.transactionCount ?? 0,
        transactionPercentile: transactionPercentiles.get(userId) ?? 100,
        transactionMaxDate: transactionMaxAmount > 0
          ? new Date(period.year, 0, 1 + stats.heatmap.indexOf(transactionMaxAmount))
          : null,
        transactionMaxAmount,
        transactionHeatmap: stats.heatmap,
        totalSpent: toDinero(stats.totalSpent),
        previousTotalSpent: toDinero(previousTotals.get(userId)?.totalSpent ?? 0),
        borrelSpent: toDinero(stats.borrelSpent),
        spentPercentile: spentPercentiles.get(userId) ?? 100,
        topProducts: topProducts.get(userId),
        categories: [...stats.categories]
          .map(([id, totalInclVat]) => ({ id, name: categoryNames.get(id), totalInclVat }))
          .sort((a, b) => b.totalInclVat - a.totalInclVat),
        syncedFrom: period.start,
        syncedTo,
      });
    });
  }

  /**
   * The most bought products of each user, each ranked among all eligible buyers of that product.
   */
  private async computeTopProducts(
    period: Period, statistics: Map<number, Statistics>, productPurchases: ProductPurchase[], ids?: number[],
  ): Promise<Map<number, WrappedProduct[]>> {
    const favourites = new Map([...statistics].map(([userId, stats]) => [
      userId,
      [...stats.products]
        .sort(([aId, a], [bId, b]) => b.count - a.count || b.total - a.total || aId - bId)
        .slice(0, TOP_PRODUCT_COUNT),
    ]));
    const productIds = [...new Set([...favourites.values()].flatMap((products) => products.map(([id]) => id)))];
    const products = await this.getProducts(productIds);

    const buyerCounts = new Map<number, Map<number, number>>();
    for (const purchase of ids ? await this.getProductPurchases(period) : productPurchases) {
      const counts = buyerCounts.get(purchase.productId) ?? new Map<number, number>();
      counts.set(purchase.userId, (counts.get(purchase.userId) ?? 0) + purchase.count);
      buyerCounts.set(purchase.productId, counts);
    }

    return new Map([...favourites].map(([userId, favouriteProducts]) => [
      userId,
      favouriteProducts.map(([id, { count, total }]) => ({
        id,
        ...products.get(id),
        count,
        totalInclVat: total,
        rank: 1 + [...buyerCounts.get(id).values()].filter((other) => other > count).length,
      })),
    ]));
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
  private purchaseRows(period: Period, userIds?: number[]): SelectQueryBuilder<Transaction> {
    const query = this.manager.createQueryBuilder(Transaction, 't')
      .innerJoin(User, 'buyer', `buyer.id = t.fromId AND ${isEligible('buyer')}`)
      .innerJoin(SubTransaction, 'st', 'st.transactionId = t.id')
      .innerJoin(SubTransactionRow, 'str', 'str.subTransactionId = st.id')
      .innerJoin(ProductRevision, 'pr', 'pr.productId = str.productProductId AND pr.revision = str.productRevision')
      .where('t.createdAt >= :start AND t.createdAt < :end', { start: period.start, end: period.end });
    if (userIds) query.andWhere('t.fromId IN (:...userIds)', { userIds });

    return query;
  }

  private async getPurchases(period: Period, userIds?: number[]) {
    const purchases = await this.purchaseRows(period, userIds)
      .innerJoin(
        PointOfSaleRevision, 'posr',
        'posr.pointOfSaleId = t.pointOfSalePointOfSaleId AND posr.revision = t.pointOfSaleRevision',
      )
      .select('t.fromId', 'userId')
      .addSelect('t.createdAt', 'createdAt')
      .addSelect('posr.useAuthentication', 'selfService')
      .addSelect('SUM(str.amount * pr.priceInclVat)', 'total')
      .groupBy('t.id')
      .addGroupBy('t.fromId')
      .addGroupBy('t.createdAt')
      .addGroupBy('posr.useAuthentication')
      .getRawMany<{ userId: number, createdAt: string | Date, selfService: number, total: string }>();

    return purchases.map((purchase) => ({
      userId: purchase.userId,
      createdAt: utcToDate(purchase.createdAt),
      selfService: Boolean(purchase.selfService),
      total: Number(purchase.total),
    }));
  }

  private async getTotals(period: Period, userIds?: number[]) {
    const totals = await this.purchaseRows(period, userIds)
      .select('t.fromId', 'userId')
      .addSelect('COUNT(DISTINCT t.id)', 'transactionCount')
      .addSelect('SUM(str.amount * pr.priceInclVat)', 'totalSpent')
      .groupBy('t.fromId')
      .getRawMany<{ userId: number, transactionCount: string, totalSpent: string }>();

    return totals.map((user) => ({
      userId: user.userId,
      transactionCount: Number(user.transactionCount),
      totalSpent: Number(user.totalSpent),
    }));
  }

  private async getProductPurchases(period: Period, userIds?: number[]): Promise<ProductPurchase[]> {
    const query = this.purchaseRows(period, userIds)
      .select('t.fromId', 'userId')
      .addSelect('str.productProductId', 'productId')
      .addSelect('pr.categoryId', 'categoryId')
      .addSelect('SUM(str.amount)', 'count')
      .addSelect('SUM(str.amount * pr.priceInclVat)', 'total')
      .groupBy('t.fromId')
      .addGroupBy('str.productProductId')
      .addGroupBy('pr.categoryId');

    const purchases = await query.getRawMany<Omit<ProductPurchase, 'count' | 'total'> & { count: string, total: string }>();
    return purchases.map((purchase) => ({
      ...purchase,
      count: Number(purchase.count),
      total: Number(purchase.total),
    }));
  }

  private async getProducts(ids: number[]) {
    if (ids.length === 0) return new Map<number, Pick<WrappedProduct, 'name' | 'image'>>();

    const products = await this.manager.createQueryBuilder(ProductRevision, 'pr')
      .withDeleted()
      .innerJoin(Product, 'product', 'product.id = pr.productId AND product.currentRevision = pr.revision')
      .leftJoin(ProductImage, 'image', 'image.id = product.imageId')
      .select('pr.productId', 'id')
      .addSelect('pr.name', 'name')
      .addSelect('image.downloadName', 'image')
      .where('pr.productId IN (:...ids)', { ids })
      .getRawMany<{ id: number, name: string, image: string | null }>();

    return new Map(products.map(({ id, name, image }) => [id, { name, image: image ?? undefined }]));
  }

  private async getCategoryNames(): Promise<Map<number, string>> {
    const categories = await this.manager.createQueryBuilder(ProductCategory, 'category')
      .select('category.id', 'id')
      .addSelect('category.name', 'name')
      .getRawMany<{ id: number, name: string }>();

    return new Map(categories.map(({ id, name }) => [id, name]));
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
        year: period.year,
        organId,
        ordinalTransactionCreated: rankings.get(organId).transactions.get(userId),
        ordinalTurnoverCreated: rankings.get(organId).turnover.get(userId),
      }));
  }

  private static async insertRows<T extends ObjectLiteral>(manager: EntityManager, entity: EntityTarget<T>, rows: T[]) {
    for (let i = 0; i < rows.length; i += INSERT_CHUNK_SIZE) {
      await manager.insert(entity, rows.slice(i, i + INSERT_CHUNK_SIZE));
    }
  }
}
