import * as yup from 'yup';
import { ref } from 'vue';
import type { Ref } from 'vue';
import type { BaseUserResponse, BaseVatGroupResponse, ProductCategoryResponse } from '@sudosos/sudosos-client';
import type { DineroObject } from 'dinero.js';
import i18n from './i18nUtils';
import type { ContainerInStore } from '@/stores/container.store';
import { formatPrice } from '@/utils/formatterUtils';

const t = i18n.global.t;

export enum USER_TYPES {
  MEMBER = 'MEMBER',
  ORGAN = 'ORGAN',
  VOUCHER = 'VOUCHER',
  LOCAL_USER = 'LOCAL_USER',
  LOCAL_ADMIN = 'LOCAL_ADMIN',
  INVOICE = 'INVOICE',
  AUTOMATIC_INVOICE = 'AUTOMATIC_INVOICE',
  INTEGRATION = 'INTEGRATION',
}

export const userUpsertSchema = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string(),
  email: yup.string().email(),
  nickname: yup.string().nullable(),
  userType: yup.mixed<USER_TYPES>().required().default(USER_TYPES.LOCAL_USER),
  isActive: yup.boolean().required().default(true),
  ofAge: yup.boolean().required().default(true),
  canGoIntoDebt: yup.boolean().required().default(false),
  id: yup.number().nullable().optional(),
});

export const editPasswordSchema = yup.object({
  password: yup.string().required(),
  passwordConfirm: yup
    .string()
    .required()
    .oneOf([yup.ref('password')], t('common.validation.password.match')),
});

export const editNFCSchema = yup.object({
  nfcCode: yup.string().required(),
});

export const updateInvoiceSettingsObject = yup.object({
  reference: yup.string().required(),
  date: yup.string().required(),
  description: yup.string().required(),
});

export const localAuthForm = yup.object({
  username: yup.string().required(),
  password: yup.string().required(),
});

export const updateInvoiceAddressingObject = yup.object({
  addressee: yup.string().required(),
  attention: yup.string(),
  street: yup.string().required(),
  postalCode: yup.string().required(),
  city: yup.string().required(),
  country: yup.string().required(),
});

export const updateInvoiceAmountObject = yup.object({
  amount: yup.number().required().default(0),
});

export const editPinSchema = yup.object({
  pin: yup
    .string()
    .required()
    .matches(/^[0-9]+$/, t('common.validation.pin.onlyDigits'))
    .min(4, t('common.validation.string.exact', { len: '4' }))
    .max(4, t('common.validation.string.exact', { len: '4' })),
  pinConfirm: yup
    .string()
    .required()
    .oneOf([yup.ref('pin')], t('common.validation.pin.match')),
});

export const userTypesCreate: Ref<Array<{ name: string; value: string }>> = ref([
  { name: 'LOCAL_USER', value: USER_TYPES.LOCAL_USER },
  { name: 'LOCAL_ADMIN', value: USER_TYPES.LOCAL_ADMIN },
  { name: 'INVOICE', value: USER_TYPES.INVOICE },
  { name: 'AUTOMATIC_INVOICE', value: USER_TYPES.AUTOMATIC_INVOICE },
]);

export const userTypes: Ref<Array<{ name: string; value: string }>> = ref([
  ...userTypesCreate.value,
  { name: 'MEMBER', value: USER_TYPES.MEMBER },
  { name: 'ORGAN', value: USER_TYPES.ORGAN },
  { name: 'VOUCHER', value: USER_TYPES.VOUCHER },
  { name: 'INTEGRATION', value: USER_TYPES.INTEGRATION },
]);

export const createPayoutSchema = yup.object({
  amount: yup
    .number()
    .required()
    .default(0)
    .test('is-less-than-balance', function (value) {
      const { balance } = this.parent;
      if (value && balance != null && value > balance) {
        return this.createError({
          message: t('modules.financial.forms.payout.amountTooHigh', {
            balance: formatPrice({ amount: balance * 100, currency: 'EUR', precision: 2 }),
          }),
        });
      }
      return true;
    }),
  balance: yup
    .number()
    .required()
    .default(0)
    .test(
      'is-not-negative',
      (params) => {
        return t('modules.financial.forms.payout.currentBalance', {
          balance: formatPrice({ amount: Math.abs(params.value * 100), currency: 'EUR', precision: 2 }, true),
        });
      },
      (value) => value >= 0,
    ),
  bankAccountNumber: yup.string().required(),
  bankAccountName: yup.string().required(),
  user: yup.mixed<BaseUserResponse>().required(),
});

export const createProductSchema = yup.object({
  name: yup.string().required(),
  priceInclVat: yup.number().required().default(0),
  vat: yup.mixed<BaseVatGroupResponse>().required(),
  category: yup.mixed<ProductCategoryResponse>().required(),
  alcoholPercentage: yup.number().required().default(0),
  featured: yup.boolean().default(false),
  preferred: yup.boolean().default(false),
  priceList: yup.boolean().default(false),
  owner: yup.mixed<BaseUserResponse>().required(),
});

export const updatePointOfSaleObject = yup.object({
  name: yup.string().required(),
  useAuthentication: yup.boolean().required(),
  containers: yup.mixed<Array<number>>().required(),
  id: yup.number().required(),
  cashierRoleIds: yup.mixed<Array<number>>(),
});

export const createPointOfSaleObject = yup.object({
  name: yup.string().required(),
  useAuthentication: yup.boolean().default(false).required(),
  owner: yup.mixed<BaseUserResponse>().required(),
});

export const addContainerObject = yup.object({
  container: yup.mixed<ContainerInStore>().required(),
});

export const containerActionSchema = yup.object({
  name: yup.string().required(),
  public: yup.boolean().required().default(false),
  owner: yup.mixed<BaseUserResponse>().required(),
});

export const createSellerPayoutObject = yup.object({
  fromDate: yup.string().required(),
  toDate: yup.string().required(),
  reference: yup.string().required(),
  user: yup.mixed<BaseUserResponse>().required(),
});

export const waiveUserFineSchema = yup.object({
  amount: yup.number().required().default(0),
});

export const createInvoiceObject = yup.object({
  forId: yup.number().required(),
  byId: yup.number(),
  addressee: yup.string().required(),
  description: yup.string().required(),
  reference: yup.string().required(),
  transactionIDs: yup.array().of(yup.number().required()).required(),
  transactionTotal: yup.mixed<DineroObject>().default({ precision: 2, currency: 'EUR', amount: 0 }).required(),
  street: yup.string().required(),
  postalCode: yup.string().required(),
  city: yup.string().required(),
  country: yup.string().required(),
  date: yup.string().required(),
  attention: yup.string(),
});

export const createWriteOffSchema = yup.object({
  user: yup.mixed<BaseUserResponse>().required(),
  balance: yup.number().required().default(0).max(0, t('modules.financial.forms.write-off.negative')),
});

export const bannerSchema = yup.object({
  name: yup.string().required(),
  duration: yup.number().required().moreThan(0).default(0),
  startDate: yup
    .string()
    .required()
    .test('is-valid-date', 'Start date must be a valid date', (value) => !isNaN(Date.parse(value || ''))),
  endDate: yup
    .string()
    .required()
    .test('is-valid-date', 'End date must be a valid date', (value) => !isNaN(Date.parse(value || '')))
    .test('not-in-past', 'End date cannot be in the past', (value) => {
      if (!value) return true;
      const now = new Date();
      const end = new Date(value);
      return end >= now;
    })
    .test('is-after-start', "End date can't be before start date", function (value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true;
      return new Date(value) >= new Date(startDate);
    }),
  active: yup.boolean().required(),
  image: yup.string().nullable().optional(),
  file: yup.mixed<File>().nullable().optional(),
  id: yup.number().nullable().optional(),
});

const parseMoney = (orig: unknown) => {
  if (orig === '' || orig === null || typeof orig === 'undefined') return undefined;
  if (typeof orig === 'number') return orig;
  if (typeof orig !== 'string') return undefined;
  const n = Number(orig);
  return Number.isNaN(n) ? undefined : n;
};

export const topupSchema = yup.object({
  balance: yup.number().required().default(0), // cents
  amount: yup
    .number()
    .transform((value, originalValue) => parseMoney(originalValue))
    .typeError('Please enter a valid amount.')
    .required('Amount is required.')
    .test('is-min10-or-balance', 'Top up should be more than €10 or settle debt exactly.', function (value) {
      if (value == null) return true;
      const balance = this.parent.balance as number;
      return value >= 10 || Math.round(value * -100) === balance;
    })
    .test('is-total-less-than-150', 'Your new balance cannot surpass €150.', function (value) {
      if (value == null) return true;
      const balance = this.parent.balance as number;
      return balance + Math.round(value * 100) <= 15000;
    }),
});

export const authRequestSchema = yup.object({
  email: yup.string().email().required(),
});

const atLeastOneUppercase = /^(?=.*[A-Z])/;
const atLeastOneLowercase = /^(?=.*[a-z])/;
const atLeastOneDigit = /^(?=.*\d)/;
const atLeastOneSpecialChar = /^(?=.*[@$!%*?&])/;
const allowedCharacters = /^[A-Za-z\d@$!%*?& ]{8,}$/;
export const authResetSchema = yup.object({
  password: yup
    .string()
    .required('This is a required field')
    .matches(atLeastOneUppercase, 'At least one uppercase letter is required')
    .matches(atLeastOneLowercase, 'At least one lowercase letter is required')
    .matches(atLeastOneDigit, 'At least one digit is required')
    .matches(atLeastOneSpecialChar, 'At least one special character is required')
    .matches(allowedCharacters, 'Password must be at least 8 characters long and only contain allowed characters'),
  passwordConfirm: yup
    .string()
    .required('This is a required field')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
  token: yup.string().required(),
  email: yup.string().email().required(),
});
