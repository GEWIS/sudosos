import type { DineroObjectResponse } from '@sudosos/sudosos-client/dist/api';

const locale: Intl.LocalesArgument = Intl.DateTimeFormat().resolvedOptions().locale;
const timeFormatOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };

export function formatDateFromString(date: string | undefined) {
  if (!date) return '';
  return date.split('T')[0];
}

export function formatTimeFromString(date: string | undefined) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString(locale, timeFormatOptions);
}

export function formatPrice(number: number) {
  return (number / 100).toFixed(2).replace('.', ',');
}

export function formatDineroObjectToString(dinero: DineroObjectResponse | undefined | null, includeCurrency = true) {
  if (dinero == null || typeof dinero.amount !== 'number') return includeCurrency ? '€0,00' : '0,00';
  const base = (dinero.amount / 10 ** (dinero.precision ?? 2)).toFixed(2).replace('.', ',');
  if (includeCurrency) return `€${base}`;
  return base;
}
