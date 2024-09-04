import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { ref } from "vue";
import type { Ref } from "vue";
import i18n from './i18nUtils';
import type {
    BaseUserResponse,
    BaseVatGroupResponse,
    ProductCategoryResponse, UserResponse
} from "@sudosos/sudosos-client";
import type { ContainerInStore } from "@/stores/container.store";

const t = i18n.global.t;

export const createUserSchema =
    yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        email: yup.string().email(),
        nickname: yup.string(),
        userType: yup.number().required().default(4),
        ofAge: yup.boolean().required().default(false),
        canGoIntoDebt: yup.boolean().required().default(false),
    });

export const simpleUserDetailsSchema =
  yup.object({
          firstName: yup.string().required(),
          lastName: yup.string().required(),
          email: yup.string().email(),
  });

export const editPasswordSchema = toTypedSchema(
  yup.object({
    password: yup.string().required(),
    passwordConfirm: yup.string().required().oneOf([yup.ref('password')], t('validation.password.match')),
  })
);

export const updateInvoiceSettingsObject = yup.object({
  reference: yup.string().required(),
  date: yup.string().required(),
  description: yup.string().required(),
});

export const updateInvoiceAddressingObject = yup.object({
  addressee: yup.string().required(),
  attention: yup.string(),
  street: yup.string().required(),
  postalCode: yup.string().required(),
  city: yup.string().required(),
  country: yup.string().required(),
});

export const updateUserDetailsObject = yup.object({
  firstName: yup.string().required(),
  lastName: yup.string(),
  email: yup.string().email(),
  nickname: yup.string().nullable(),
  userType: yup.number().required(),
  isActive: yup.boolean().required().default(true),
  ofAge: yup.boolean().required().default(false),
  canGoIntoDebt: yup.boolean().required().default(false),
});

export const editPinSchema = toTypedSchema(
  yup.object({
    pin: yup.string().required()
      .matches(/^[0-9]+$/, t('validation.pin.onlyDigits'))
      .min(4, t('validation.string.exact', { len: '4' } ))
      .max(4, t('validation.string.exact', { len: '4' } )),
    pinConfirm: yup.string().required().oneOf([yup.ref('pin')], t('validation.pin.match')),
  })
);

export const userTypes : Ref<Array<{name: string, value: number}>> = ref([
  { name: 'MEMBER', value: 1 },
  { name: 'ORGAN', value: 2 },
  { name: 'VOUCHER', value: 3 },
  { name: 'LOCAL_USER', value: 4 },
  { name: 'LOCAL_ADMIN', value: 5 },
  { name: 'INVOICE', value: 6 },
  { name: 'AUTOMATIC_INVOICE', value: 7 },
]);

export const createPayoutSchema =
  yup.object({
    amount: yup.number().required().default(0),
    bankAccountNumber: yup.string().required(),
    bankAccountName: yup.string().required(),
    user: yup.mixed<BaseUserResponse>().required(),
  });

export const createProductSchema =
    yup.object({
        name: yup.string().required(),
        priceInclVat: yup.number().required().default(0),
        vat: yup.mixed<BaseVatGroupResponse>().required(),
        category: yup.mixed<ProductCategoryResponse>().required(),
        alcoholPercentage: yup.number().required().default(0),
        featured: yup.boolean().default(false),
        preferred: yup.boolean().default(false),
        priceList: yup.boolean().default(false),
        owner: yup.mixed<UserResponse>().required()
    });

export const updatePointOfSaleObject =
    yup.object({
        name: yup.string().required(),
        useAuthentication: yup.boolean().required(),
        containers: yup.mixed<Array<number>>().required(),
        id: yup.number().required(),
        cashierRoleIds: yup.mixed<Array<number>>()
    });

export const createPointOfSaleObject =
    yup.object({
        name: yup.string().required(),
        useAuthentication: yup.boolean().default(false).required(),
        owner: yup.mixed<UserResponse>().required(),
    });

export const addContainerObject =
    yup.object({
        container: yup.mixed<ContainerInStore>().required()
    });

