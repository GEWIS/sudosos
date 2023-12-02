import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";

export const userDetailsSchema = toTypedSchema(
    yup.object({
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        email: yup.string().email(),
        userType: yup.string().required(),
        isActive: yup.boolean().required().default(true),
    })
);

export const simpleUserDetailsSchema = toTypedSchema(
  yup.object({
          firstName: yup.string().required(),
          lastName: yup.string().required(),
          email: yup.string().email(),
  })
);
