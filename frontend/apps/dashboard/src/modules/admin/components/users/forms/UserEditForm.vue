<template>
  <div class="flex flex-column gap-2">
    <InputSpan
      id="name"
      :attributes="form.model.firstName.attr.value"
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
      :attributes="form.model.lastName?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.lastName"
      :label="t('common.lastName')"
      :placeholder="t('common.lastName')"
      type="text"
      :value="form.model.lastName?.value.value"
      @update:value="form.context.setFieldValue('lastName', $event)"
    />
    <InputSpan
      id="name"
      :attributes="form.model.nickname?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.nickname"
      :label="t('common.nickname')"
      :placeholder="t('common.nickname')"
      type="text"
      :value="form.model.nickname?.value.value || undefined"
      @update:value="form.context.setFieldValue('nickname', $event)"
    />
    <InputSpan
      v-if="!(props.user?.type === 'MEMBER')"
      id="name"
      :attributes="form.model.email?.attr.value"
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
      :attributes="form.model.userType?.attr.value"
      disabled
      :errors="form.context.errors.value.userType"
      :label="t('common.usertype')"
      :placeholder="t('common.placeholders.selectType')"
      type="usertype"
      :value="form.model.userType?.value.value"
      @update:value="updateType($event)"
    />
    <InputSpan
      id="name"
      :attributes="form.model.isActive?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.isActive"
      :label="t('common.active')"
      type="boolean"
      :value="form.model.isActive?.value.value"
      @update:value="form.context.setFieldValue('isActive', $event)"
    />
    <InputSpan
      id="name"
      :attributes="form.model.ofAge?.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.ofAge"
      :label="t('modules.admin.forms.user.ofAge')"
      type="boolean"
      :value="form.model.ofAge?.value.value"
      @update:value="form.context.setFieldValue('ofAge', $event)"
    />
    <InputSpan
      id="name"
      :attributes="form.model.canGoIntoDebt?.attr.value"
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
import type { UpdateUserRequest, UserResponse } from '@sudosos/sudosos-client';
import { type PropType } from 'vue';
import * as yup from 'yup';
import apiService from '@/services/ApiService';
import { type Form, setSubmit } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import { updateUserDetailsObject } from '@/utils/validation-schema';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['update:edit']);

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateUserDetailsObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const updateType = (event: string) => {
  if (event) props.form.context.setFieldValue('userType', event);
};

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    const updateUserRequest: UpdateUserRequest = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      nickname: values.nickname || '',
      active: values.isActive,
      ofAge: values.ofAge,
      canGoIntoDebt: values.canGoIntoDebt,
    };
    apiService.user
      .updateUser(props.user.id, updateUserRequest)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.userUpdated'),
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
