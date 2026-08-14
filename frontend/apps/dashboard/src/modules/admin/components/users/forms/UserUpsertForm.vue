<template>
  <form class="flex flex-col gap-2 md:min-w-[25rem]">
    <InputSpan
      id="firstName"
      class="max-w-[13rem]"
      v-bind="form.model.firstName.attr.value"
      :disabled="disabled || managed"
      :errors="form.context.errors.value.firstName"
      :label="t('common.firstName')"
      :placeholder="isCreate ? t('common.firstName') : ''"
      type="text"
      :value="form.model.firstName.value.value"
      @update:value="form.context.setFieldValue('firstName', $event)"
    />
    <InputSpan
      v-if="show.lastName"
      id="lastName"
      class="max-w-[13rem]"
      v-bind="form.model.lastName?.attr.value"
      :disabled="disabled || managed"
      :errors="form.context.errors.value.lastName"
      :label="t('common.lastName')"
      :placeholder="isCreate ? t('common.lastName') : ''"
      type="text"
      :value="form.model.lastName?.value.value"
      @update:value="form.context.setFieldValue('lastName', $event)"
    />
    <InputSpan
      v-if="show.nickname"
      id="nickname"
      class="max-w-[13rem]"
      v-bind="form.model.nickname?.attr.value"
      :disabled="disabled"
      :errors="form.context.errors.value.nickname"
      :label="t('common.nickname')"
      :placeholder="isCreate ? t('common.nickname') : ''"
      type="text"
      :value="form.model.nickname?.value.value || undefined"
      @update:value="form.context.setFieldValue('nickname', $event)"
    />
    <InputSpan
      v-if="show.email"
      id="email"
      class="max-w-[13rem]"
      v-bind="form.model.email?.attr.value"
      :disabled="disabled || managed"
      :errors="form.context.errors.value.email"
      :label="t('common.email')"
      :placeholder="isCreate ? t('common.placeholders.email') : ''"
      type="text"
      :value="form.model.email?.value.value"
      @update:value="form.context.setFieldValue('email', $event)"
    />
    <InputSpan
      id="userType"
      class="max-w-[13rem]"
      v-bind="form.model.userType?.attr.value"
      :disabled="disabled || !isCreate"
      :errors="form.context.errors.value.userType"
      :label="t('common.usertype')"
      :placeholder="t('common.usertype')"
      :type="isCreate ? 'usertypecreate' : 'usertype'"
      :value="form.model.userType?.value.value"
      @update:value="form.context.setFieldValue('userType', $event)"
    />
    <InputSpan
      v-if="!isCreate"
      id="isActive"
      v-bind="form.model.isActive?.attr.value"
      :disabled="disabled"
      :errors="form.context.errors.value.isActive"
      :label="t('common.active')"
      type="boolean"
      :value="form.model.isActive?.value.value"
      @update:value="form.context.setFieldValue('isActive', $event)"
    />
    <InputSpan
      v-if="show.ofAge"
      id="ofAge"
      class="max-w-[13rem]"
      v-bind="form.model.ofAge?.attr.value"
      :disabled="disabled"
      :errors="form.context.errors.value.ofAge"
      :label="t('modules.admin.forms.user.ofAge')"
      type="boolean"
      :value="form.model.ofAge?.value.value"
      @update:value="form.context.setFieldValue('ofAge', $event)"
    />
    <InputSpan
      v-if="show.debt"
      id="canGoIntoDebt"
      class="max-w-[13rem]"
      v-bind="form.model.canGoIntoDebt?.attr.value"
      :disabled="disabled"
      :errors="form.context.errors.value.canGoIntoDebt"
      :label="t('modules.admin.forms.user.canGoIntoDebt')"
      type="boolean"
      :value="form.model.canGoIntoDebt?.value.value"
      @update:value="form.context.setFieldValue('canGoIntoDebt', $event)"
    />
  </form>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'primevue/usetoast';
import { type Form, setSubmit } from '@/utils/formUtils';
import { userUpsertSchema } from '@/utils/validation-schema';
import InputSpan from '@/components/InputSpan.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import { useUserFieldVisibility } from '@/composables/userFieldVisibility';

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['submit:success']);

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof userUpsertSchema>>>,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  preTyped: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const isCreate = computed(() => props.form.model.id?.value.value === undefined);

const { show, managed } = useUserFieldVisibility(props.form.model.userType.value, isCreate, props.preTyped);

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    const userStore = useUserStore();
    const u = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email || '',
      nickname: values.nickname || '',
      ofAge: values.ofAge,
      canGoIntoDebt: values.canGoIntoDebt,
    };
    if (isCreate.value) {
      userStore
        .createUser(
          {
            ...u,
            type: values.userType,
          },
          apiService,
        )
        .then((user) => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.userCreated'),
            life: 3000,
          });
          emit('submit:success', user);
        })
        .catch((err) => {
          handleError(err, toast);
        });
    } else {
      const id = props.form.model.id?.value.value;
      if (!id) return;
      userStore
        .updateUser(id, { ...u, active: values.isActive }, apiService)
        .then((u) => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.userUpdated'),
            life: 3000,
          });
          emit('submit:success', u);
        })
        .catch((err) => {
          handleError(err, toast);
        });
    }
  }),
);
</script>

<style scoped lang="scss"></style>
