/**
 * Given a Date, string or number, returns the fiscal year it belongs to.
 * Fiscal year starts July 1, ends June 30 next year.
 * E.g., July 1 2024 – June 30 2025 => fiscal year 2025.
 */
function getFiscalYear(date: Date | string | number): number {
  const d = new Date(date);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth(); // 0 = Jan, 6 = July

  // If date is before July, belongs to previous fiscal year
  return month < 6 ? year : year + 1;
}

/**
 * Given a fiscal year (e.g., 2025), returns its start and end date.
 * Start: July 1, previous year, 00:00 UTC
 * End: July 1, current year, 00:00 UTC (exclusive)
 */
function getFiscalYearRange(fiscalYear: number): { start: string; end: string } {
  const start = new Date(Date.UTC(fiscalYear - 1, 6, 1, 0, 0, 0, 0)).toISOString();
  const end = new Date(Date.UTC(fiscalYear, 6, 1, 0, 0, 0, 0)).toISOString();
  return { start, end };
}

/**
 * Returns an array of all fiscal years since 2023 (inclusive) up to current fiscal year.
 */
function getFiscalYearList(): number[] {
  const currentFiscalYear = getFiscalYear(new Date());
  const firstFiscalYear = 2023;
  const years: number[] = [];
  for (let y = firstFiscalYear; y <= currentFiscalYear; y++) {
    years.unshift(y);
  }
  return years;
}

/**
 * Returns a composable API for fiscal year logic.
 */
export function useFiscalYear() {
  return {
    getFiscalYear,
    getFiscalYearRange,
    getFiscalYearList,
  };
}
