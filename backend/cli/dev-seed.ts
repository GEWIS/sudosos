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
 * Dev seed entry point.
 *
 * Creates a minimal but complete dataset for local development and manual testing.
 * Covers every major entity type so the frontend and POS can be used immediately.
 *
 * Default credentials after running this seed:
 *   - Admin:  admin@sudosos.nl  / admin  / PIN 0000  (LOCAL_ADMIN)
 *   - User:   user@sudosos.nl   / user   / PIN 1111  (LOCAL_USER)
 *   - Alice:  alice@gewis.nl    / PIN 1234 (MEMBER, member of GEWIS organ)
 *   - Bob:    bob@gewis.nl      / PIN 5678 (MEMBER, member of GEWIS organ)
 */

import log4js from 'log4js';
import dinero, { Currency } from 'dinero.js';
import Database from '../src/database/database';
import { Application } from '../src';
import initializeDiskStorage from '../src/files/initialize';
import DefaultRoles from '../src/rbac/default-roles';
import UserSeeder from '../test/seed/user-seeder';
import VatGroupSeeder from '../test/seed/catalogue/vat-group-seeder';
import ProductCategorySeeder from '../test/seed/catalogue/product-category-seeder';
import ProductSeeder from '../test/seed/catalogue/product-seeder';
import ContainerSeeder from '../test/seed/catalogue/container-seeder';
import PointOfSaleSeeder from '../test/seed/catalogue/point-of-sale-seeder';
import TransactionSeeder from '../test/seed/ledger/transaction-seeder';
import DepositSeeder from '../test/seed/ledger/deposit-seeder';
import PayoutRequestSeeder from '../test/seed/ledger/payout-request-seeder';
import FineSeeder from '../test/seed/ledger/fine-seeder';
import InactiveAdministrativeCostSeeder from '../test/seed/ledger/inactive-administrative-cost-seeder';
import SellerPayoutSeeder from '../test/seed/ledger/seller-payout-seeder';
import InvoiceSeeder from '../test/seed/ledger/invoice-seeder';
import WriteOffSeeder from '../test/seed/ledger/write-off-seeder';
import Config from '../src/config';
import { applyConfiguredLogLevel } from '../src/helpers/logging';

export default async function devSeed() {
  // 1. Users
  const { admin, user, alice, bob, organ, invoice } = await new UserSeeder().init();
  const logger = log4js.getLogger('DevSeed');
  logger.info('Users created: admin, user, alice, bob, organ, invoice');

  // 2. Roles (assigns Super Admin to admin automatically)
  await DefaultRoles.synchronize();
  logger.info('Default roles synchronized');

  // 3. Catalogue
  const vatGroups = await new VatGroupSeeder().init();
  const categories = await new ProductCategorySeeder().init();
  const products = await new ProductSeeder().init(organ, vatGroups, categories);
  const containers = await new ContainerSeeder().init(organ, products);
  const { barRevision } = await new PointOfSaleSeeder().init(organ, containers);
  logger.info('Catalogue created: products, containers, Bar POS');

  // 4. Transactions - alice and bob buy from Bar; invoice user also buys (for invoicing)
  await new TransactionSeeder().init([alice, bob], barRevision);
  const { transactions: invoiceTransactions } = await new TransactionSeeder().init([invoice], barRevision);
  logger.info('Transactions created: alice and bob purchasing from Bar, invoice user purchasing for invoice');

  // 5. Stripe deposits - credits alice with EUR 50.00 and user with EUR 20.00
  await new DepositSeeder().init(alice);
  await new DepositSeeder().init(user, 2000);
  logger.info('Stripe deposits created: alice +EUR 50.00, user +EUR 20.00');

  // 6. Payout requests - alice has a pending request, user's has been approved by admin
  await new PayoutRequestSeeder().init(alice);
  await new PayoutRequestSeeder().init(user, 1500, admin);
  logger.info('Payout requests created: alice requests EUR 10.00 (pending), user requests EUR 15.00 (approved)');

  // 7. Fines - bob's is still outstanding, alice's gets waived
  await new FineSeeder().init(bob);
  await new FineSeeder().initWaived(alice);
  logger.info('Fines created: bob fined EUR 5.00 (outstanding), alice fined EUR 5.00 (waived)');

  // 8. Inactive administrative cost - bob charged EUR 0.05
  await new InactiveAdministrativeCostSeeder().init(bob);
  logger.info('Inactive administrative cost created: bob charged EUR 0.05');

  // 9. Seller payouts - organ withdraws revenue twice, in two separate payouts
  await new SellerPayoutSeeder().init(organ, dinero({ amount: 500 }));
  await new SellerPayoutSeeder().init(organ, dinero({ amount: 200 }), 'DEV-002');
  logger.info('Seller payouts created: organ withdraws EUR 5.00 and EUR 2.00');

  // 10. Invoice - invoice for invoice user, rows derived from invoice user's transactions
  await new InvoiceSeeder().init(invoice, admin, invoiceTransactions);
  logger.info('Invoice created: invoice user (rows matched to transactions)');

  // 11. Write-off - a closed user is written off
  const { user: closedUser } = await new WriteOffSeeder().init();
  logger.info(`Write-off created: user ${closedUser.id} written off`);
}

async function createApp() {
  const config = Config.get();
  const application = new Application();
  application.logger = log4js.getLogger('DevSeed');
  applyConfiguredLogLevel(application.logger);
  application.logger.info('Starting dev seed...');

  application.connection = await Database.initialize();

  dinero.defaultCurrency = config.currency.code as Currency;
  dinero.defaultPrecision = config.currency.precision;

  initializeDiskStorage();

  try {
    await devSeed();
    application.logger.info('Dev seed complete.');
  } catch (e) {
    application.logger.error('Dev seed failed', e);
    process.exit(1);
  }
}

if (require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  createApp();
}
