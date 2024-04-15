import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { ref } from "vue";
import type { Ref } from "vue";

export const userDetailsSchema = toTypedSchema(
    yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        email: yup.string().email(),
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
    passwordConfirm: yup.string().required().oneOf([yup.ref('password')], 'Passwords must match'),
  })
);

export const editPinSchema = toTypedSchema(
  yup.object({
    pin: yup.string().required()
      .matches(/^[0-9]+$/, "Must be only digits")
      .min(4, 'Must be exactly 4 digits')
      .max(4, 'Must be exactly 4 digits'),
    pinConfirm: yup.string().required().oneOf([yup.ref('pin')], 'PINs must match'),
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
