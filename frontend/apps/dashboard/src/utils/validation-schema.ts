import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { ref } from "vue";
import type { Ref } from "vue";
import i18n from './i18nUtils';

const t = i18n.global.t;

export const userDetailsSchema = toTypedSchema(
    yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        email: yup.string().email(),
        nickname: yup.string(),
        userType: yup.mixed().required(),
        isActive: yup.boolean().required().default(true),
        ofAge: yup.boolean().required().default(false),
        canGoIntoDebt: yup.boolean().required().default(false),
    })
);

export const simpleUserDetailsSchema = toTypedSchema(
  yup.object({
          firstName: yup.string().required(),
          lastName: yup.string().required(),
          email: yup.string().email(),
  })
);

export const editPasswordSchema = toTypedSchema(
  yup.object({
    password: yup.string().required(),
    passwordConfirm: yup.string().required().oneOf([yup.ref('password')], t('validation.password.match')),
  })
);

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
