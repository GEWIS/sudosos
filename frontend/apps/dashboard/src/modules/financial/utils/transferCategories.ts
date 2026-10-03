export const CREDIT_CATEGORIES = new Set(['deposit', 'invoice', 'waivedFines', 'writeOff', 'manualCreation']);

export function isCreditCategory(category: string): boolean {
  return CREDIT_CATEGORIES.has(category);
}

/**
 * Maps a transfer category (the `:category` route param) to the key that names it.
 * The financial overview labels categories in the plural under
 * `financialOverview.transferTypes`; the transfer view needs the singular form to read
 * as a title ("Deposit transfers"), so those live under `transfer.types` and share
 * these keys.
 *
 * "Singular" is an English-grammar description of the en/pl strings, which `titleForType`
 * appends a word to ("Deposit" + " transfers"). Dutch grammar does not compose that way, so
 * `transfer.types` under `nl` holds an already-complete plural noun ("Stortingstransacties")
 * that `titleForType` uses as-is.
 */
const CATEGORY_LABEL_KEYS: Record<string, string> = {
  deposit: 'deposits',
  sellerPayout: 'sellerPayouts',
  invoice: 'invoices',
  creditInvoice: 'creditInvoices',
  fine: 'fines',
  waivedFines: 'waivedFines',
  inactiveAdministrativeCost: 'adminCosts',
  writeOff: 'writeOffs',
  payoutRequest: 'payoutRequests',
  manualCreation: 'manualCreations',
  manualDeletion: 'manualDeletions',
};

/**
 * Whether the string is a transfer category the backend accepts. The keys of
 * `CATEGORY_LABEL_KEYS` mirror the categories `GET /transfers` validates against, which
 * rejects anything else with a 400.
 */
export function isTransferCategory(category: string): boolean {
  return Object.hasOwn(CATEGORY_LABEL_KEYS, category);
}

/** Singular name of the category, for use in a title. */
export function transferCategoryLabelKey(category: string): string | undefined {
  if (!isTransferCategory(category)) return undefined;
  return `modules.financial.transfer.types.${CATEGORY_LABEL_KEYS[category]}`;
}

/** Plural name of the category, as the financial overview lists it. */
export function transferCategoryPluralLabelKey(category: string): string | undefined {
  if (!isTransferCategory(category)) return undefined;
  return `modules.financial.financialOverview.transferTypes.${CATEGORY_LABEL_KEYS[category]}`;
}
