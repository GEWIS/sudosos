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
 * This is the module page of balance-service.
 *
 * @module balance
 */

import BalanceResponse, {
  TotalBalanceResponse,
  UserTypeTotalBalanceResponse,
} from '../controller/response/balance-response';
import DineroTransformer from '../entity/transformer/dinero-transformer';
import { toMySQLString } from '../helpers/timestamps';
import { Dinero } from 'dinero.js';
import { OrderingDirection } from '../helpers/ordering';
import { defaultPagination, PaginationParameters } from '../helpers/pagination';
import { UserType } from '../entity/user/user';
import WithManager from '../database/with-manager';
import { DineroObjectResponse } from '../controller/response/dinero-response';
import Config from '../config';
import BalancePeriodService, {
  dialect, floorNaive, GRAIN_CODE, GRAINS, inList, ledgerSql, minStr, NEVER,
} from './balance-period-service';

export enum BalanceOrderColumn {
  ID = 'id',
  AMOUNT = 'amount',
  FINEAMOUNT = 'fine',
  FINESINCE = 'fineSince',
}

export interface UpdateBalanceParameters {
  ids?: number[],
}

export interface GetBalanceParameters extends UpdateBalanceParameters {
  date?: Date;
  minBalance?: Dinero;
  maxBalance?: Dinero;
  hasFine?: boolean;
  minFine?: Dinero;
  maxFine?: Dinero;
  userTypes?: UserType[];
  orderBy?: BalanceOrderColumn;
  orderDirection?: OrderingDirection;
  allowDeleted?: boolean;
  inactive?: boolean;
}



/**
 * Converts the input to an VatDeclarationPeriod
 * @param input - The input which should be converted.
 * @returns VatDeclarationPeriod - The parsed VatDeclarationPeriod.
 * @throws TypeError - If the input is not a valid VatDeclarationPeriod
 */
export function asBalanceOrderColumn(input: any): BalanceOrderColumn | undefined {
  if (!input) return undefined;
  if (!Object.values(BalanceOrderColumn).includes(input)) {
    throw new TypeError(`Input '${input}' is not a valid BalanceOrderColumn.`);
  }
  return input;
}

export default class BalanceService extends WithManager {
  /**
   * Parse the given SQL date to a ISO date. This custom conversion is necessary, because
   * SQLite returns timestamps in UTC, while MariaDB/MySQL returns timestamps in the local timezone.
   * @param rawDate
   * @private
   */
  private static sqlTimeToISOTime(rawDate: any): string | null {
    let date = null;
    if (rawDate) {
      const dateSinceUtc = Config.get().database.isSqlite ? rawDate + 'Z' : rawDate;
      date = new Date(dateSinceUtc).toISOString();
    }
    return date;
  }

  private static asBalanceResponse(rawBalance: any, date: Date): BalanceResponse {
    return {
      id: rawBalance.id,
      firstName: rawBalance.firstName,
      lastName: rawBalance.lastName,
      nickname: rawBalance.nickname,
      type: rawBalance.type,
      date: date.toISOString(),
      amount: DineroTransformer.Instance.from(Number(rawBalance.amount)).toObject(),
      lastTransactionId: Number(rawBalance.lastTransactionId),
      lastTransactionDate: this.sqlTimeToISOTime(rawBalance.lastTransactionDate),
      lastTransferId: Number(rawBalance.lastTransferId),
      fine: rawBalance.fine ? DineroTransformer.Instance.from(rawBalance.fine).toObject() : null,
      fineSince: this.sqlTimeToISOTime(rawBalance.fineSince),
      fineWaived: rawBalance.fine && rawBalance.fineWaived
        ? DineroTransformer.Instance.from(rawBalance.fineWaived).toObject() : null,
      nrFines: Number(rawBalance.nrFines) ?? 0,
      memberId: rawBalance.memberId ?? null,
    };
  }

  private periods(): BalancePeriodService {
    return new BalancePeriodService(this.manager);
  }

  /**
   * Bring the balance periods up to date: close the days that have ended and rebuild the
   * periods of users with backdated inserts. With `ids`, also rebuild the whole history of
   * those users. The nightly cron calls this, so the first read of the day does not have to.
   */
  public async updateBalances(params: UpdateBalanceParameters): Promise<void> {
    await this.periods().ensureFresh();
    if (params.ids?.length) await this.periods().rebuild(NEVER, params.ids);
  }

  /**
   * Rebuild balance periods after transactions or transfers were deleted or changed. Inserts
   * are picked up on read and need no call.
   *
   * - With `ids` and `at` (the `createdAt` of the deleted or changed event): rebuild only the
   *   day and month containing `at`, for those users.
   * - With `ids` only: rebuild the whole history of those users.
   * - Without `ids`: rebuild everything.
   * @param ids - the users whose balance changed.
   * @param at - the `createdAt` of the transaction or transfer that changed.
   */
  public async clearBalanceCache(ids?: number | number[], at?: Date): Promise<void> {
    if (ids === undefined) {
      await this.periods().rebuildAll();
      return;
    }
    const list = Array.isArray(ids) ? ids : [ids];
    if (list.length === 0) return;
    await this.periods().ensureFresh();
    await this.periods().rebuild(at ? toMySQLString(at) : NEVER, list, at ? toMySQLString(at) : undefined);
  }

  /**
   * Rebuild the closed balance periods overlapping [from, until] (until omitted: everything
   * closed), for all users or only `ids`, in one DB transaction. Use this after changing closed
   * history outside the services, for example with raw SQL.
   * @param from - start of the range to rebuild (inclusive).
   * @param ids - the users to rebuild; all users when omitted.
   * @param until - end of the range to rebuild (inclusive).
   */
  public async rebuildPeriods(from: Date, ids?: number[], until?: Date): Promise<void> {
    await this.periods().rebuild(toMySQLString(from), ids, until ? toMySQLString(until) : undefined);
  }

  /**
   * The per-user balance subquery (userId, amount, lastTransactionId, lastTransferId) at naive
   * time `t` (undefined = now, no upper bound), given closedUntil. It sums
   *   - month rows with periodStart < cut(month),
   *   - day rows with cut(month) <= periodStart < cut(day),
   *   - a live ledger scan of events with cut(day) <= createdAt [<= t],
   * where cut(g) = min(floor_g(t), floor_g(closedUntil)).
   */
  private static balanceSql(params: any[], closedUntil: string, t: string | undefined, ids?: number[]): string {
    const d = dialect();
    const branches: string[] = [];
    const idFilter = (col: string) => {
      if (!ids) return '';
      params.push(...ids);
      return ` AND ${col} IN (${inList(ids)})`;
    };
    let lo = NEVER;
    GRAINS.forEach((g) => {
      const cut = t === undefined ? floorNaive(g, closedUntil) : minStr(floorNaive(g, t), floorNaive(g, closedUntil));
      if (lo < cut) {
        params.push(GRAIN_CODE[g], lo, cut);
        branches.push('SELECT userId, net, lastTransactionId AS txId, lastTransferId AS tfId FROM balance_period '
          + `WHERE grain = ? AND periodStart >= ? AND periodStart < ?${idFilter('userId')}`);
      }
      lo = cut > lo ? cut : lo;
    });
    branches.push(ledgerSql(d, params, lo, t, true, ids));
    return 'SELECT x.userId AS userId, SUM(x.net) AS amount, MAX(x.txId) AS lastTransactionId, '
      + `MAX(x.tfId) AS lastTransferId FROM (${
        branches.map((b, i) => `SELECT userId, net, txId, tfId FROM (${b}) b${i}`).join(' UNION ALL ')
      }) x GROUP BY x.userId`;
  }

  /**
   * Get balance of users matching the given filters.
   *
   * See {@link GetBalanceParameters} for the full list of filter fields (user ids, date snapshot,
   * min/max balance and fine, user types, ordering, `allowDeleted`, `inactive`).
   *
   * @param params - filter fields; see {@link GetBalanceParameters}.
   * @param pagination - pagination options.
   * @returns the balances and the total count.
   */
  public async getBalances({
    ids, date, minBalance, maxBalance, hasFine, minFine, maxFine, userTypes, orderDirection, orderBy, allowDeleted, inactive,
  }: GetBalanceParameters, pagination: PaginationParameters = {}): Promise<[BalanceResponse[], number]> {
    // Return the empty response if request has no ids.
    if (ids?.length === 0) {
      return [[], 0];
    }

    const closedUntil = await this.periods().ensureFresh();
    const t = date ? toMySQLString(date) : undefined;

    const params: any[] = [];
    let inner = 'SELECT u.id AS id, u.firstName AS firstName, u.lastName AS lastName, u.nickname AS nickname, '
      + 'u.type AS type, COALESCE(b.amount, 0) AS amount, COALESCE(b.lastTransactionId, -1) AS lastTransactionId, '
      + 'COALESCE(b.lastTransferId, -1) AS lastTransferId, lt.createdAt AS lastTransactionDate, '
      + 'f.fine AS fine, f.fineSince AS fineSince, f.fineWaived AS fineWaived, f.nrFines AS nrFines, '
      + 'mu.memberId AS memberId '
      + `FROM \`user\` u LEFT JOIN (${BalanceService.balanceSql(params, closedUntil, t, ids)}) b ON b.userId = u.id `
      + 'LEFT JOIN `transaction` lt ON lt.id = b.lastTransactionId '
      + 'LEFT JOIN (SELECT SUM(fine.amount) AS fine, MAX(user_fine_group.createdAt) AS fineSince, '
      + 'MAX(transfer.amountInclVat) AS fineWaived, COUNT(fine.id) AS nrFines, `user`.id AS id FROM fine '
      + 'INNER JOIN user_fine_group ON fine.userFineGroupId = user_fine_group.id '
      + 'INNER JOIN `user` ON user_fine_group.userId = `user`.id '
      + 'LEFT JOIN transfer ON user_fine_group.waivedTransferId = transfer.id '
      + 'WHERE `user`.currentFinesId = user_fine_group.id GROUP BY `user`.id) f ON f.id = u.id '
      + 'LEFT JOIN member_user mu ON mu.userId = u.id '
      + `WHERE u.type NOT IN ('${UserType.POINT_OF_SALE}') `;
    if (ids) {
      inner += `AND u.id IN (${inList(ids)}) `;
      params.push(...ids);
    }
    if (userTypes !== undefined) inner += `AND u.type IN (${userTypes.map((ut) => `'${ut}'`).join(',')}) `;
    if (!allowDeleted) inner += 'AND u.deleted = 0 ';
    if (inactive) inner += 'AND u.active = 0 ';

    let query = `SELECT * FROM (${inner}) q WHERE 1 = 1 `;
    if (minBalance !== undefined) query += `AND q.amount >= ${minBalance.getAmount()} `;
    if (maxBalance !== undefined) query += `AND q.amount <= ${maxBalance.getAmount()} `;
    if (hasFine === false) query += 'AND q.fine IS NULL ';
    if (hasFine === true) query += 'AND q.fine IS NOT NULL ';
    if (minFine !== undefined) query += `AND q.fine >= ${minFine.getAmount()} `;
    if (maxFine !== undefined) query += `AND q.fine <= ${maxFine.getAmount()} `;
    if (orderBy !== undefined) query += `ORDER BY q.${orderBy} ${orderDirection ?? ''} `;

    const take = pagination.skip || pagination.take ? pagination.take || defaultPagination() : pagination.take;
    const skip = pagination.skip;

    let recordsQuery = query;
    if (take) recordsQuery += `LIMIT ${take} `;
    if (skip) recordsQuery += `OFFSET ${skip} `;

    const balances = await this.manager.query(recordsQuery, params);
    const count = take || skip
      ? Number((await this.manager.query(`SELECT COUNT(*) AS c FROM (${query}) cq`, params))[0].c)
      : balances.length;

    return [
      balances.map((b: object) => BalanceService.asBalanceResponse(b, date ?? new Date())),
      count,
    ];
  }

  /**
   * Get balance for single user
   * @param id ID of user
   * @param date Date to calculate balance for
   */
  public async getBalance(id: number, date?: Date): Promise<BalanceResponse> {
    return (await this.getBalances({ ids: [id], allowDeleted: true, date }))[0][0];
  }

  /**
   * Get the total balance of SudoSOS and
   * @param date Date to check the balances for
   * @param allowDeleted allow balances of deleted users to be returned
   */
  public async calculateTotalBalances(date: Date, allowDeleted?: boolean): Promise<TotalBalanceResponse> {
    const getBalancesResponse = await this.getBalances({ date, allowDeleted });
    const allBalanceResponses = getBalancesResponse[0];

    const posBalanceRes = allBalanceResponses.filter((response) => response.amount.amount >= 0);
    const negBalanceRes = allBalanceResponses.filter((response) => response.amount.amount < 0);

    const totalPos =  BalanceService.calculateTotal(posBalanceRes);
    const totalNeg = BalanceService.calculateTotal(negBalanceRes);

    const typeTotals: UserTypeTotalBalanceResponse[] = [];
    const userTypes = Object.values(UserType);

    userTypes.forEach((type) => {
      const typesPosBalanceResponse = allBalanceResponses.filter((response) => response.type === type && response.amount.amount >= 0);
      const typesNegBalanceResponse = allBalanceResponses.filter((response) => response.type === type && response.amount.amount < 0);
      const totalTypedPos = BalanceService.calculateTotal(typesPosBalanceResponse);
      const totalTypedNeg = BalanceService.calculateTotal(typesNegBalanceResponse);

      typeTotals.push({
        userType: type,
        totalPositive: totalTypedPos,
        totalNegative: totalTypedNeg,
      });
    });

    return {
      date: date.toISOString(),
      totalPositive: totalPos,
      totalNegative: totalNeg,
      userTypeBalances: typeTotals,
    };
  }

  private static calculateTotal(balanceResponse: BalanceResponse[]): DineroObjectResponse {
    return DineroTransformer.Instance.from(balanceResponse.reduce((sum, value) => sum + value.amount.amount, 0)).toObject();
  }
}
