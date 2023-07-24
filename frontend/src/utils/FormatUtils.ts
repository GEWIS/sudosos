import {DineroObjectResponse} from "@sudosos/sudosos-client/dist/api";

export function formatDateFromString(date: string) {
  return date.split('T')[0];
}

export function formatTimeFromString(date: string) {
  return date.split('T')[1].slice(0, 5);
}

export function formatPrice(number: number) {
  return (number / 100).toFixed(2).replace('.',',');
};

export function formatDineroObjectToString(dinero: DineroObjectResponse, includeCurrency = true) {
  const base = (dinero.amount / Math.pow(10, dinero.precision)).toFixed(2).replace('.',',');
  if (includeCurrency) return '€'+base;
  return base;
}
