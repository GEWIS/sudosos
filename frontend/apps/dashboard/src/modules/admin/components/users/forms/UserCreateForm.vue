<template>
  <div class="flex flex-col gap-2">
    <InputSpan
      id="name"
      v-bind="form.model.firstName.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.firstName"
      :label="t('common.firstName')"
      :placeholder="t('common.firstName')"
      type="text"
      :value="form.model.firstName.value.value"
      @update:value="form.context.setFieldValue('firstName', $event)"
    />
    <InputSpan
      id="name"
      v-bind="form.model.lastName?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.lastName"
      :label="t('common.lastName')"
      placeholder="Doe"
      type="text"
      :value="form.model.lastName?.value.value"
      @update:value="form.context.setFieldValue('lastName', $event)"
    />
    <InputSpan
      id="name"
      v-bind="form.model.nickname?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.nickname"
      :label="t('common.nickname')"
      :placeholder="t('common.nickname')"
      type="text"
      :value="form.model.nickname?.value.value || undefined"
      @update:value="form.context.setFieldValue('nickname', $event)"
    />
    <InputSpan
      id="name"
      v-bind="form.model.email?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.email"
      :label="t('common.email')"
      :placeholder="t('common.placeholders.email')"
      type="text"
      :value="form.model.email?.value.value"
      @update:value="form.context.setFieldValue('email', $event)"
    />
    <InputSpan
      id="name"
      v-bind="form.model.userType?.attr.value"
      :errors="form.context.errors.value.userType"
      :label="t('common.usertype')"
      :placeholder="t('common.usertype')"
      type="usertype"
      :value="form.model.userType?.value.value"
      @update:value="form.context.setFieldValue('userType', $event)"
    />
    <InputSpan
      id="name"
      v-bind="form.model.ofAge?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.ofAge"
      :label="t('modules.admin.forms.user.ofAge')"
      type="boolean"
      :value="form.model.ofAge?.value.value"
      @update:value="form.context.setFieldValue('ofAge', $event)"
    />
    <InputSpan
      id="name"
      v-bind="form.model.canGoIntoDebt?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.canGoIntoDebt"
      :label="t('modules.admin.forms.user.canGoIntoDebt')"
      type="boolean"
      :value="form.model.canGoIntoDebt?.value.value"
      @update:value="form.context.setFieldValue('canGoIntoDebt', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { CreateUserRequest } from '@sudosos/sudosos-client';
import { type PropType } from 'vue';
import * as yup from 'yup';
import { createUserSchema } from '@/utils/validation-schema';
import { type Form, setSubmit } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['update:edit']);

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createUserSchema>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: true,
  },
});

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    const createUserRequest: CreateUserRequest = {
      canGoIntoDebt: values.canGoIntoDebt,
      ofAge: values.ofAge,
      firstName: values.firstName,
      lastName: values.lastName || '',
      email: values.email || '',
      nickname: values.nickname || '',
      type: values.userType,
    };

    apiService.user
      .createUser(createUserRequest)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.userCreated'),
          life: 3000,
        });
        emit('update:edit', false);
      })
      .catch((error) => {
        handleError(error, toast);
      });
  }),
);
</script>

<style scoped></style>
