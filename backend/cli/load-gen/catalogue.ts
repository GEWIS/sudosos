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
 * Reference data (users, VAT groups, catalogue, points of sale) for the load generator.
 */

import { Rng } from './rng';
import { BulkWriter, makeWriter } from './bulk';
import { fmtUs, SPAN_US, START_US } from './time';

export interface TierConfig {
  transactions: number;
  users: number;
  sellers: number;
  pointsOfSale: number;
  products: number;
}

export const TIERS: Record<string, TierConfig> = {
  S: { transactions: 1_000, users: 50, sellers: 4, pointsOfSale: 3, products: 40 },
  M: { transactions: 200_000, users: 1_000, sellers: 8, pointsOfSale: 6, products: 150 },
  L: { transactions: 5_000_000, users: 5_000, sellers: 12, pointsOfSale: 10, products: 400 },
  XL: { transactions: 30_000_000, users: 10_000, sellers: 16, pointsOfSale: 14, products: 800 },
};

export interface ContainerRevisionInfo {
  containerId: number;
  revision: number;
  ownerId: number;
  /** Parallel arrays: the product revisions contained in this container revision. */
  productIds: number[];
  productRevs: number[];
  prices: number[];
}

export interface PosRevisionInfo {
  posId: number;
  revision: number;
  /** Indices into Catalogue.containerRevisions. */
  containerRevisions: number[];
}

export interface Catalogue {
  adminId: number;
  sellerIds: number[];
  posUserIds: number[];
  /** Regular users (MEMBER / LOCAL_USER / ORGAN buyers), including those planted with zero events. */
  regularIds: number[];
  /** Regular users that will take part in events (the rest are the planted zero-event users). */
  activeIds: number[];
  zeroEventIds: number[];
  invoiceUserIds: number[];
  userTypes: string[]; // indexed by user id
  vatGroupIds: number[];
  containerRevisions: ContainerRevisionInfo[];
  posRevisions: PosRevisionInfo[];
  userCount: number;
}

const FIRST = ['Ada', 'Bob', 'Cleo', 'Dirk', 'Eva', 'Finn', 'Gus', 'Hana', 'Ivo', 'Jade'];

function userRow(
  id: number, type: string, active: boolean, deleted: boolean, rng: Rng, createdAt: string,
): string {
  const ofAge = rng.chance(0.85) ? 1 : 0;
  const canDebt = type === 'ORGAN' || rng.chance(0.1) ? 1 : 0;
  return `(${createdAt},${createdAt},1,${id},'${rng.pick(FIRST)}','User${id}',${active ? 1 : 0},${ofAge},`
    + `'user${id}@loadtest.invalid',${deleted ? 1 : 0},'${type}',0,NULL,NULL,${canDebt},0,NULL,NULL,0,`
    + `${type === 'MEMBER' || type === 'LOCAL_USER' ? 1 : 0},0)`;
}

const USER_COLS = ['id', 'firstName', 'lastName', 'active', 'ofAge',
  'email', 'deleted', 'type', 'extensiveDataProcessing', 'nickname', 'currentFinesId', 'canGoIntoDebt',
  'inactiveNotificationSend', 'lastSeen', 'expiryDate', 'expiryNotificationSent', 'tosRequired',
  'productSelfService'];

const BASE_COLS = ['createdAt', 'updatedAt', 'version'];

export async function buildCatalogue(cfg: TierConfig, rng: Rng): Promise<Catalogue> {
  const t0 = fmtUs(START_US);
  const w = async (table: string, cols: string[], rows: string[]): Promise<void> => {
    const writer: BulkWriter = await makeWriter(table, [...BASE_COLS, ...cols]);
    rows.forEach((r) => writer.push(r));
    await writer.flush();
    await writer.close();
  };
  const stamp = (i: number, n: number): string => fmtUs(START_US + Math.floor((i / Math.max(n, 1)) * SPAN_US * 0.2));

  // ---- Users --------------------------------------------------------------------------
  const userTypes: string[] = [''];
  const userRows: string[] = [];
  let nextId = 1;
  const addUser = (type: string, active: boolean, deleted: boolean): number => {
    const id = nextId++;
    userTypes[id] = type;
    userRows.push(userRow(id, type, active, deleted, rng, t0));
    return id;
  };
  const adminId = addUser('LOCAL_ADMIN', true, false);
  const sellerIds = Array.from({ length: cfg.sellers }, () => addUser('ORGAN', true, false));
  const posUserIds = Array.from({ length: cfg.pointsOfSale }, () => addUser('POINT_OF_SALE', true, false));
  const invoiceUserIds = [addUser('INVOICE', true, false), addUser('INVOICE', true, false)];
  addUser('VOUCHER', true, false);
  addUser('INTEGRATION', true, false);

  const regularIds: number[] = [];
  while (nextId <= cfg.users) {
    const r = rng.next();
    const type = r < 0.78 ? 'MEMBER' : r < 0.93 ? 'LOCAL_USER' : 'ORGAN';
    // The first two regular users are always one deleted and one inactive user (also at tier S).
    const first = regularIds.length;
    const deleted = first === 0 || rng.chance(0.03);
    const active = first !== 1 && !deleted && !rng.chance(0.06);
    regularIds.push(addUser(type, active, deleted));
  }
  // ~5% of regular users never get an event. Pick them without disturbing the main sequence.
  const zeroEventIds: number[] = [];
  const activeIds: number[] = [];
  const zeroTarget = Math.max(2, Math.round(regularIds.length * 0.05));
  const zeroSet = new Set<number>();
  const zrng = new Rng(0xABCDEF ^ cfg.users);
  while (zeroSet.size < zeroTarget) zeroSet.add(regularIds[zrng.int(0, regularIds.length - 1)]);
  regularIds.forEach((id) => (zeroSet.has(id) ? zeroEventIds : activeIds).push(id));
  await w('user', USER_COLS, userRows);

  // ---- VAT groups ---------------------------------------------------------------------
  const vat = [['High', 21, 0, 0], ['Low', 9, 0, 0], ['Zero', 0, 0, 0], ['Old high', 19, 1, 1]];
  await w('vat_group', ['id', 'name', 'percentage', 'deleted', 'hidden'],
    vat.map((v, i) => `(${t0},${t0},1,${i + 1},'${v[0]}',${v[1]},${v[2]},${v[3]})`));
  const vatGroupIds = [1, 2, 3];

  // ---- Categories ---------------------------------------------------------------------
  const nCat = 8;
  await w('product_category', ['id', 'name'],
    Array.from({ length: nCat }, (_, i) => `(${t0},${t0},1,${i + 1},'Category ${i + 1}')`));
  const closure = await makeWriter('product_category_closure', ['id_ancestor', 'id_descendant']);
  for (let i = 1; i <= nCat; i++) closure.push(`(${i},${i})`);
  await closure.flush();
  await closure.close();

  // ---- Products and revisions ---------------------------------------------------------
  const productRevs: { rev: number; price: number }[][] = [];
  const productRows: string[] = [];
  const revRows: string[] = [];
  for (let p = 1; p <= cfg.products; p++) {
    const nRev = rng.pick([1, 1, 2, 2, 3, 4, 5, 6]);
    const owner = rng.pick(sellerIds);
    const base = Math.max(10, Math.round(Math.exp(rng.normal() * 0.6 + 5.0) / 5) * 5); // ~150c median
    const freebie = rng.chance(0.03);
    const list: { rev: number; price: number }[] = [];
    for (let r = 1; r <= nRev; r++) {
      let price = Math.max(5, Math.round((base * rng.float(0.75, 1.35)) / 5) * 5);
      if (freebie || rng.chance(0.05)) price = 0;
      list.push({ rev: r, price });
      const ts = stamp(r, nRev + 1);
      revRows.push(`(${ts},${ts},1,'Product ${p} r${r}',${price},${rng.chance(0.3) ? '5.00' : '0.00'},${p},${r},`
        + `${rng.pick(vatGroupIds)},${rng.int(1, nCat)},0,0,0)`);
    }
    productRevs[p] = list;
    productRows.push(`(${t0},${t0},1,${p},${nRev},${owner},NULL,NULL)`);
  }
  await w('product', ['id', 'currentRevision', 'ownerId', 'imageId', 'deletedAt'], productRows);
  await w('product_revision', ['name', 'priceInclVat', 'alcoholPercentage', 'productId', 'revision',
    'vatId', 'categoryId', 'featured', 'preferred', 'priceList'], revRows);

  // ---- Containers ---------------------------------------------------------------------
  const containerRows: string[] = [];
  const crRows: string[] = [];
  const linkRows: string[] = [];
  const containerRevisions: ContainerRevisionInfo[] = [];
  const crevByContainer: number[][] = [];
  let containerId = 0;
  for (const owner of sellerIds) {
    const nCont = rng.int(2, 4);
    for (let c = 0; c < nCont; c++) {
      containerId++;
      const nRev = rng.int(1, 3);
      containerRows.push(`(${t0},${t0},1,${containerId},${nRev},${rng.chance(0.5) ? 1 : 0},${owner},NULL)`);
      crevByContainer[containerId] = [];
      for (let r = 1; r <= nRev; r++) {
        const ts = stamp(r, nRev + 1);
        crRows.push(`(${ts},${ts},1,'Container ${containerId} r${r}',${containerId},${r})`);
        const want = Math.min(cfg.products, rng.int(8, 16));
        const chosen = new Set<number>();
        while (chosen.size < want) chosen.add(rng.int(1, cfg.products));
        const info: ContainerRevisionInfo = {
          containerId, revision: r, ownerId: owner, productIds: [], productRevs: [], prices: [],
        };
        for (const p of chosen) {
          const pr = rng.pick(productRevs[p]);
          info.productIds.push(p);
          info.productRevs.push(pr.rev);
          info.prices.push(pr.price);
          linkRows.push(`(${containerId},${r},${p},${pr.rev})`);
        }
        crevByContainer[containerId].push(containerRevisions.length);
        containerRevisions.push(info);
      }
    }
  }
  await w('container', ['id', 'currentRevision', 'public', 'ownerId', 'deletedAt'], containerRows);
  await w('container_revision', ['name', 'containerId', 'revision'], crRows);
  const link = await makeWriter('container_revision_products_product_revision',
    ['containerRevisionContainerId', 'containerRevisionRevision', 'productRevisionProductId',
      'productRevisionRevision']);
  linkRows.forEach((r) => link.push(r));
  await link.flush();
  await link.close();

  // ---- Points of sale -----------------------------------------------------------------
  const posRows: string[] = [];
  const posRevRows: string[] = [];
  const posLinkRows: string[] = [];
  const posRevisions: PosRevisionInfo[] = [];
  for (let i = 0; i < cfg.pointsOfSale; i++) {
    const posId = i + 1;
    const nRev = rng.int(1, 3);
    posRows.push(`(${t0},${t0},1,${posId},${nRev},${sellerIds[i % sellerIds.length]},NULL,${posUserIds[i]})`);
    for (let r = 1; r <= nRev; r++) {
      const ts = stamp(r, nRev + 1);
      posRevRows.push(`(${ts},${ts},1,'POS ${posId} r${r}',${rng.chance(0.5) ? 1 : 0},${posId},${r})`);
      const picked = new Set<number>();
      const want = Math.min(containerRevisions.length, rng.int(3, 7));
      while (picked.size < want) {
        const cont = rng.int(1, containerId);
        picked.add(rng.pick(crevByContainer[cont]));
      }
      const list = [...picked];
      list.forEach((ci) => posLinkRows.push(
        `(${posId},${r},${containerRevisions[ci].containerId},${containerRevisions[ci].revision})`));
      posRevisions.push({ posId, revision: r, containerRevisions: list });
    }
  }
  await w('point_of_sale', ['id', 'currentRevision', 'ownerId', 'deletedAt', 'userId'], posRows);
  await w('point_of_sale_revision', ['name', 'useAuthentication', 'pointOfSaleId', 'revision'], posRevRows);
  const pl = await makeWriter('point_of_sale_revision_containers_container_revision',
    ['pointOfSaleRevisionPointOfSaleId', 'pointOfSaleRevisionRevision', 'containerRevisionContainerId',
      'containerRevisionRevision']);
  posLinkRows.forEach((r) => pl.push(r));
  await pl.flush();
  await pl.close();

  return {
    adminId, sellerIds, posUserIds, regularIds, activeIds, zeroEventIds, invoiceUserIds, userTypes,
    vatGroupIds, containerRevisions, posRevisions, userCount: cfg.users,
  };
}
