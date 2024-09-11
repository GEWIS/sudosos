<template>
  <div class="flex flex-column gap-2">
    <InputSpan :label="t('common.firstName')"
               :value="form.model.firstName.value.value"
               :attributes="form.model.firstName.attr.value"
               @update:value="form.context.setFieldValue('firstName', $event)"
               :errors="form.context.errors.value.firstName"
               :disabled="!edit"
               id="name" :placeholder="t('common.firstName')" type="text" />
    <InputSpan :label="t('common.lastName')"
               :value="form.model.lastName?.value.value"
               :attributes="form.model.lastName?.attr.value"
               @update:value="form.context.setFieldValue('lastName', $event)"
               :errors="form.context.errors.value.lastName"
               :disabled="!edit"
               id="name" placeholder="Doe" type="text" />
    <InputSpan :label="t('common.nickname')"
               :value="form.model.nickname?.value.value || undefined"
               :attributes="form.model.nickname?.attr.value"
               @update:value="form.context.setFieldValue('nickname', $event)"
               :errors="form.context.errors.value.nickname"
               :disabled="!edit"
               id="name" :placeholder="t('common.nickname')" type="text" />
    <InputSpan
               :label="t('common.email')"
               :value="form.model.email?.value.value"
               :attributes="form.model.email?.attr.value"
               @update:value="form.context.setFieldValue('email', $event)"
               :errors="form.context.errors.value.email"
               :disabled="!edit"
               id="name" :placeholder="t('common.placeholders.email')" type="text" />
    <InputSpan :label="t('common.usertype')"
               :value="form.model.userType?.value.value"
               :attributes="form.model.userType?.attr.value"
               @update:value="form.context.setFieldValue('userType', $event)"
               :errors="form.context.errors.value.userType"
               id="name" :placeholder="t('common.usertype')" type="usertype"/>
    <InputSpan :label="t('modules.admin.forms.user.ofAge')"
               :value="form.model.ofAge?.value.value"
               :attributes="form.model.ofAge?.attr.value"
               @update:value="form.context.setFieldValue('ofAge', $event)"
               :errors="form.context.errors.value.ofAge"
               :disabled="!edit"
               id="name" type="boolean"/>
    <InputSpan :label="t('modules.admin.forms.user.canGoIntoDebt')"
               :value="form.model.canGoIntoDebt?.value.value"
               :attributes="form.model.canGoIntoDebt?.attr.value"
               @update:value="form.context.setFieldValue('canGoIntoDebt', $event)"
               :errors="form.context.errors.value.canGoIntoDebt"
               :disabled="!edit"
               id="name" type="boolean"/>
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { type Form, setSubmit } from "@/utils/formUtils";
import type { CreateUserRequest } from "@sudosos/sudosos-client";
import { type PropType } from "vue";
import { createUserSchema } from "@/utils/validation-schema";
import * as yup from "yup";
import apiService from "@/services/ApiService";
import { handleError } from "@/utils/errorUtils";

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

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  const createUserRequest: CreateUserRequest = {
    canGoIntoDebt: values.canGoIntoDebt,
    ofAge: values.ofAge,
    firstName: values.firstName,
    lastName: values.lastName || '',
    email: values.email || '',
    nickname: values.nickname || '',
    type: values.userType
  };

  await apiService.user.createUser(createUserRequest).then(() => {
    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.userCreated'),
      life: 3000,
    });
    emit('update:edit', false);
  }).catch((error) => {
    handleError(error, toast);
  });
}));

</script>

<style scoped>

</style>
