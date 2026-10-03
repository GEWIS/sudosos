#!/usr/bin/env node

import { readdirSync, existsSync, statSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const srcDir = join(__dirname, '../src');

// Components deliberately left without a Storybook story. Add a path (relative to src/,
// forward slashes) here only when someone has actually decided this component will never
// need one, not because it hasn't been gotten to yet.
//
// The bulk of this list is every .vue file that lives outside a components/ directory:
// route-level views (router-driven, fetch their own data, not reusable presentational
// units), layout shells, and the root App component. None of those are what Storybook
// stories are for. Everything under components/ (160 files, at the time this list was
// written) is a real candidate and stays out of this list until someone excludes it
// individually, the same way App.vue and friends were excluded here.
const EXCLUDE = [
  // Root app shell -- mounted once by main.ts, never rendered in isolation.
  'App.vue',

  // Layout shells -- structural page wrappers, not presentational components.
  'layout/DashboardLayout.vue',
  'layout/PageContainer.vue',
  'layout/PublicLayout.vue',
  'modules/auth/layouts/AuthLayout.vue',

  // Route-level views -- router-driven pages, not reusable in isolation.
  'views/ErrorView.vue',
  'views/WrappedView.vue',
  'modules/admin/views/AdminBannersView.vue',
  'modules/admin/views/AdminDashboardView.vue',
  'modules/admin/views/AdminMaintainerView.vue',
  'modules/admin/views/AdminRBACView.vue',
  'modules/admin/views/AdminSingleUserView.vue',
  'modules/admin/views/AdminUserOverView.vue',
  'modules/auth/views/AuthLocalView.vue',
  'modules/auth/views/AuthLoginView.vue',
  'modules/auth/views/AuthQrConfirmView.vue',
  'modules/auth/views/AuthResetView.vue',
  'modules/auth/views/AuthTermsOfServiceView.vue',
  'modules/financial/views/administrative/AdministrativeView.vue',
  'modules/financial/views/debtor/DebtorHandoutView.vue',
  'modules/financial/views/debtor/DebtorView.vue',
  'modules/financial/views/invoice/InvoiceAccountOverview.vue',
  'modules/financial/views/invoice/InvoiceCreateView.vue',
  'modules/financial/views/invoice/InvoiceInfoView.vue',
  'modules/financial/views/invoice/InvoiceOverview.vue',
  'modules/financial/views/overview/FinancialOverviewTable.vue',
  'modules/financial/views/overview/FinancialOverviewView.vue',
  'modules/financial/views/payouts/PayoutsView.vue',
  'modules/financial/views/seller/SellerView.vue',
  'modules/financial/views/transaction/TransactionView.vue',
  'modules/financial/views/transfer/TransferView.vue',
  'modules/financial/views/vat/VatView.vue',
  'modules/financial/views/write-offs/WriteOffsView.vue',
  'modules/seller/views/POSInfoView.vue',
  'modules/seller/views/POSOverviewView.vue',
  'modules/seller/views/ProductsContainersView.vue',
  'modules/seller/views/SellerPayoutsView.vue',
  'modules/user/views/UserLandingView.vue',
  'modules/user/views/UserProfileView.vue',
  'modules/user/views/UserTransactionsView.vue',
];

function findVueFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findVueFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.vue')) {
      results.push(fullPath);
    }
  }
  return results;
}

const vueFiles = findVueFiles(srcDir).sort();

const missing = [];
let excludedCount = 0;
let coveredCount = 0;

for (const vueFile of vueFiles) {
  const relPath = relative(srcDir, vueFile).split('\\').join('/');
  if (EXCLUDE.includes(relPath)) {
    excludedCount += 1;
    continue;
  }
  const storyFile = vueFile.replace(/\.vue$/, '.stories.ts');
  if (existsSync(storyFile) && statSync(storyFile).isFile()) {
    coveredCount += 1;
  } else {
    missing.push(relPath);
  }
}

console.info(`Storybook coverage: ${coveredCount}/${vueFiles.length} components have a story`);
if (excludedCount > 0) {
  console.info(`(${excludedCount} excluded on purpose, see EXCLUDE in this script)`);
}
console.info('');

if (missing.length === 0) {
  console.info('Every component has a story. Nothing left to do.');
} else {
  console.info(`${missing.length} component(s) with no story yet:`);
  for (const path of missing) {
    console.info(`  - ${path}`);
  }
}
