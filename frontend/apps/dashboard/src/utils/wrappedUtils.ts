import type { WrappedOrganMemberResponse, WrappedResponse } from '@gewis/sudosos-client';

export function organName({ organ }: WrappedOrganMemberResponse): string {
  return `${organ.firstName} ${organ.lastName}`.trim();
}

/**
 * The organ for which the user created the most turnover, relative to its other sellers.
 */
export function bestOrgan(wrapped: WrappedResponse): WrappedOrganMemberResponse | undefined {
  return [...wrapped.organs].sort((a, b) => a.ordinalTurnoverCreated - b.ordinalTurnoverCreated)[0];
}

/**
 * Formats a date the Dutch way, day before month and with a 24-hour clock, in the language of the user.
 */
export function formatDate(date: Date, locale: string, options: Intl.DateTimeFormatOptions): string {
  return date.toLocaleString(locale === 'en' ? 'en-GB' : locale, { ...options, hourCycle: 'h23' });
}

export function dateOfDay(year: number, day: number): Date {
  return new Date(year, 0, 1 + day);
}

/**
 * Name of a weekday, where 0 is Monday.
 */
export function weekdayName(weekday: number, locale: string, format: 'long' | 'narrow'): string {
  // 2024 started on a Monday.
  return new Date(2024, 0, 1 + weekday).toLocaleDateString(locale, { weekday: format });
}

/**
 * Number of transactions per weekday, Monday first.
 */
export function transactionsPerWeekday({ year, transactions }: WrappedResponse): number[] {
  const weekdays = new Array<number>(7).fill(0);
  transactions.transactionHeatmap.forEach((count, day) => {
    weekdays[(dateOfDay(year, day).getDay() + 6) % 7] += count;
  });
  return weekdays;
}

export function transactionsPerMonth({ year, transactions }: WrappedResponse): number[] {
  const months = new Array<number>(12).fill(0);
  transactions.transactionHeatmap.forEach((count, day) => {
    months[dateOfDay(year, day).getMonth()] += count;
  });
  return months;
}

/**
 * Longest run of consecutive days with at least one transaction.
 */
export function longestStreak(heatmap: number[]): number {
  let longest = 0;
  let current = 0;
  for (const count of heatmap) {
    current = count > 0 ? current + 1 : 0;
    longest = Math.max(longest, current);
  }
  return longest;
}

export function activeDays(heatmap: number[]): number {
  return heatmap.filter((count) => count > 0).length;
}
