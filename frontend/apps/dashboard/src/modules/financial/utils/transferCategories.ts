export const CREDIT_CATEGORIES = new Set(['deposit', 'invoice', 'waivedFines', 'writeOff', 'manualCreation']);

export function isCreditCategory(category: string): boolean {
  return CREDIT_CATEGORIES.has(category);
}
