import type { VoucherGroupAddressRequest } from '@gewis/sudosos-client';

export type VoucherGroupAddressField = keyof VoucherGroupAddressRequest;

/** Mandatory address fields; `attention` is optional. Mirrors the backend check. */
export const REQUIRED_ADDRESS_FIELDS: VoucherGroupAddressField[] = [
  'addressee',
  'street',
  'postalCode',
  'city',
  'country',
];

export const emptyVoucherGroupAddress = (): VoucherGroupAddressRequest => ({
  addressee: '',
  attention: '',
  street: '',
  postalCode: '',
  city: '',
  country: '',
});

export const pickVoucherGroupAddress = (source: Partial<VoucherGroupAddressRequest>): VoucherGroupAddressRequest => ({
  addressee: source.addressee ?? '',
  attention: source.attention ?? '',
  street: source.street ?? '',
  postalCode: source.postalCode ?? '',
  city: source.city ?? '',
  country: source.country ?? '',
});

export const trimVoucherGroupAddress = (address: VoucherGroupAddressRequest): VoucherGroupAddressRequest => ({
  addressee: address.addressee.trim(),
  attention: (address.attention ?? '').trim(),
  street: address.street.trim(),
  postalCode: address.postalCode.trim(),
  city: address.city.trim(),
  country: address.country.trim(),
});

export const isAddressFieldValid = (address: Partial<VoucherGroupAddressRequest>, field: VoucherGroupAddressField) =>
  !REQUIRED_ADDRESS_FIELDS.includes(field) || (address[field] ?? '').trim().length > 0;

export const isVoucherGroupAddressComplete = (address: Partial<VoucherGroupAddressRequest>): boolean =>
  REQUIRED_ADDRESS_FIELDS.every((field) => isAddressFieldValid(address, field));
