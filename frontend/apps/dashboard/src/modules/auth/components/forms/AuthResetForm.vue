<template>
  <form class="flex flex-col gap-2" @submit.prevent="() => form.submit()">
    <input hidden type="password" />
    <InputSpan
      id="password"
      v-bind="form.model.password.attr.value"
      class="max-w-[15rem]"
      column
      :errors="form.context.errors.value.password"
      :label="t('modules.auth.reset.newPassword')"
      :placeholder="t('modules.auth.reset.newPassword')"
      type="password"
      :value="form.model.password.value.value"
      @update:value="form.context.setFieldValue('password', $event)"
    />

    <InputSpan
      id="passwordConfirm"
      v-bind="form.model.passwordConfirm.attr.value"
      class="max-w-[15rem]"
      column
      :errors="form.context.errors.value.passwordConfirm"
      :label="t('modules.auth.reset.confirmPassword')"
      :placeholder="t('modules.auth.reset.confirmPassword')"
      type="password"
      :value="form.model.passwordConfirm.value.value"
      @update:value="form.context.setFieldValue('passwordConfirm', $event)"
    />
    <Button class="w-full" :label="t('modules.auth.reset.reset')" type="submit" />
  </form>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import * as yup from 'yup';
import type { authResetSchema } from '@/utils/validation-schema';
import { type Form, setSubmit } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import { handleError } from '@/utils/errorUtils';
import apiService from '@/services/ApiService';

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['success']);

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof authResetSchema>>>,
    required: true,
  },
});

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    apiService.authenticate
      .resetLocalWithToken({
        accountMail: values.email,
        token: values.token,
        password: values.password,
      })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.resetPasswordSuccess'),
          life: 3000,
        });
        emit('success');
      })
      .catch((err) => {
        handleError(err, toast);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
