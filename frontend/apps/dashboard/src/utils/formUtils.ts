import * as yup from 'yup';
import type { Ref } from 'vue';
import type { BaseFieldProps, FormContext, GenericObject, TypedSchema } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import { useForm } from 'vee-validate';
import type { AnyObject } from 'yup';
import { ref } from 'vue';

export interface Form<T extends yup.AnyObject> {
  context: FormContext<T, T>;
  schema: TypedSchema<T>;
  model: { [K in keyof T]: { value: Ref<T[K]>; attr: Ref<BaseFieldProps & GenericObject> } };
  submit: () => Promise<void>;
  success: Ref<boolean | null>;
}

const schemaToFields = <T extends AnyObject>(
  yupSchema: yup.ObjectSchema<T, yup.AnyObject, T, ''>,
  ctx: FormContext,
): { [K in keyof T['fields']]: { value: Ref; attr: Ref<BaseFieldProps & GenericObject> } } => {
  const fields = {} as { [K in keyof T['fields']]: { value: Ref; attr: Ref<BaseFieldProps & GenericObject> } };
  for (const key in yupSchema['fields']) {
    if (Object.prototype.hasOwnProperty.call(yupSchema['fields'], key)) {
      const f = ctx.defineField(key as keyof typeof ctx.defineField);
      fields[key as keyof T['fields']] = { value: f[0], attr: f[1] };
    }
  }
  return fields;
};

export function schemaToForm<T extends AnyObject>(yupSchema: yup.ObjectSchema<T>): Form<T> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const schema = toTypedSchema(yupSchema) as TypedSchema<T>; // Convert to typed schema

  const context: FormContext<T, T> = useForm<T>({
    validationSchema: schema,
  });

  const model = schemaToFields<T>(yupSchema, context);
  return {
    context,
    schema,
    model,
    // @ts-expect-error placeholder value
    submit: () => {
      console.error('Submit not implemented');
    },
    success: ref(null),
  };
}

export function setSubmit<T extends AnyObject>(form: Form<T>, submit: () => Promise<void>) {
  form.submit = submit;
}

export function setSuccess<T extends AnyObject>(form: Form<T>, success: boolean | null) {
  form.success.value = success;
}

export function getProperty<T extends yup.AnyObject, K extends keyof T>(form: Form<T>, key: K): T[K] | undefined {
  return form.model[key]?.value.value ?? undefined;
}
