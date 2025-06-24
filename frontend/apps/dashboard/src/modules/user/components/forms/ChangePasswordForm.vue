<template>
  <div class="flex flex-col gap-2 justify-between">
    <InputSpan
      id="password"
      v-bind="form.model.password.attr.value"
      :errors="form.context.errors.value.password"
      :label="t('modules.user.profile.passwordNew')"
      type="password"
      :value="form.model.password.value.value"
      @update:value="form.context.setFieldValue('password', $event)"
    />
    <InputSpan
      id="passwordConfirm"
      v-bind="form.model.passwordConfirm.attr.value"
      :errors="form.context.errors.value.passwordConfirm"
      :label="t('modules.user.profile.passwordConfirm')"
      type="password"
      :value="form.model.passwordConfirm.value.value"
      @update:value="form.context.setFieldValue('passwordConfirm', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import type { PropType } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'primevue/usetoast';
import { editPasswordSchema } from '@/utils/validation-schema';
import { type Form, setSubmit } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof editPasswordSchema>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { t } = useI18n();
const userStore = useUserStore();
const toast = useToast();
const emit = defineEmits(['submit:success', 'submit:error']);

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    if (userStore.getCurrentUser.user) {
      apiService.user
        .updateUserLocalPassword(userStore.getCurrentUser.user.id, { password: values.passwordConfirm })
        .then(() => {
          emit('submit:success', values);
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: `${t('common.toast.success.passwordUpdated')}`,
            life: 3000,
          });
          props.form.context.resetForm();
        })
        .catch((err) => {
          emit('submit:error', err);
          handleError(err, toast);
        });
    }
  }),
);
</script>

<style scoped lang="scss"></style>
