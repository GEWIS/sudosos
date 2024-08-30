<template>
  <div class="flex flex-column gap-2">
    <InputSpan :label="t('userDetails.First name')"
               :value="form.model.firstName.value.value"
               :attributes="form.model.firstName.attr.value"
               @update:value="form.context.setFieldValue('firstName', $event)"
               :errors="form.context.errors.value.firstName"
               :disabled="!edit"
               id="name" :placeholder="t('userDetails.First name')" type="text" />
    <InputSpan :label="t('userDetails.Last name')"
               :value="form.model.lastName?.value.value"
               :attributes="form.model.lastName?.attr.value"
               @update:value="form.context.setFieldValue('lastName', $event)"
               :errors="form.context.errors.value.lastName"
               :disabled="!edit"
               id="name" placeholder="Doe" type="text" />
    <InputSpan :label="t('userDetails.Nickname')"
               :value="form.model.nickname?.value.value || undefined"
               :attributes="form.model.nickname?.attr.value"
               @update:value="form.context.setFieldValue('nickname', $event)"
               :errors="form.context.errors.value.nickname"
               :disabled="!edit"
               id="name" :placeholder="t('userDetails.Nickname')" type="text" />
    <InputSpan
        v-if="!(props.user?.type === 'MEMBER')"
               :label="t('userDetails.Email address')"
               :value="form.model.email?.value.value"
               :attributes="form.model.email?.attr.value"
               @update:value="form.context.setFieldValue('email', $event)"
               :errors="form.context.errors.value.email"
               :disabled="!edit"
               id="name" placeholder="first.last@example.com" type="text" />
    <InputSpan :label="t('userDetails.Usertype')"
               :value="form.model.userType?.value.value"
               :attributes="form.model.userType?.attr.value"
               @update:value="form.context.setFieldValue('userType', $event)"
               :errors="form.context.errors.value.userType"
               id="name" :placeholder="t('userDetails.Usertype')" type="usertype" disabled/>
    <InputSpan :label="t('userDetails.Active')"
               :value="form.model.isActive?.value.value"
               :attributes="form.model.isActive?.attr.value"
               @update:value="form.context.setFieldValue('isActive', $event)"
               :errors="form.context.errors.value.isActive"
               :disabled="!edit"
               id="name" :placeholder="t('userDetails.Active')" type="boolean"/>
    <InputSpan :label="t('profile.ofAge')"
               :value="form.model.ofAge?.value.value"
               :attributes="form.model.ofAge?.attr.value"
               @update:value="form.context.setFieldValue('ofAge', $event)"
               :errors="form.context.errors.value.ofAge"
               :disabled="!edit"
               id="name" :placeholder="t('profile.ofAge')" type="boolean"/>
    <InputSpan :label="t('profile.canGoIntoDebt')"
               :value="form.model.canGoIntoDebt?.value.value"
               :attributes="form.model.canGoIntoDebt?.attr.value"
               @update:value="form.context.setFieldValue('canGoIntoDebt', $event)"
               :errors="form.context.errors.value.canGoIntoDebt"
               :disabled="!edit"
               id="name" :placeholder="t('profile.canGoIntoDebt')" type="boolean"/>
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { type Form, setSubmit } from "@/utils/formUtils";
import apiService from "@/services/ApiService";
import type { UpdateUserRequest, UserResponse } from "@sudosos/sudosos-client";
import { type PropType } from "vue";
import * as yup from "yup";
import { updateUserDetailsObject } from "@/utils/validation-schema";
import { handleError } from "@/utils/errorUtils";

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

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  const updateUserRequest: UpdateUserRequest = {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    nickname: values.nickname || "",
    active: values.isActive,
    ofAge: values.ofAge,
    canGoIntoDebt: values.canGoIntoDebt,
  };
  await apiService.user.updateUser(props.user.id, updateUserRequest).then(() => {
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.userUpdated'),
      life: 3000,
    });
    emit('update:edit', false);
  }).catch((error) => {
    handleError(error, toast);
  });
}));
</script>
