<template>
  <div class="flex flex-col">
    <InputSpan
      id="name"
      v-bind="form.model.amount.attr.value"
      :errors="form.context.errors.value.amount"
      :label="t('common.amount')"
      :placeholder="t('common.amount')"
      type="currency"
      :value="form.model.amount.value.value"
      @update:value="form.context.setFieldValue('amount', $event)"
    />
    <div class="cursor-pointer flex font-italic justify-end text-color-secondary underline" @click="setToWaiveAll">
      {{ t('modules.admin.singleUser.balance.waiveAllFines') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { BalanceResponse, UserResponse } from '@sudosos/sudosos-client';
import { type PropType } from 'vue';
import * as yup from 'yup';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { waiveUserFineSchema } from '@/utils/validation-schema';
import { handleError } from '@/utils/errorUtils';
import { type Form, setSubmit } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import apiService from '@/services/ApiService';

const { t } = useI18n();
const toast = useToast();

const isVisible = defineModel<boolean>('isVisible');

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
  balance: {
    type: Object as PropType<BalanceResponse>,
    required: true,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof waiveUserFineSchema>>>,
    required: true,
  },
});

const userStore = useUserStore();

function setToWaiveAll() {
  props.form.context.setFieldValue('amount', props.balance.fine!.amount / 100);
}

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    if (props.balance.fine && values.amount * 100 > props.balance.fine.amount) {
      props.form.context.setFieldError('amount', t('modules.admin.singleUser.balance.waiveFineTooMuch'));
      return;
    }

    userStore
      .waiveUserFine(
        props.user.id,
        {
          amount: values.amount * 100,
          currency: 'EUR',
          precision: 2,
        },
        apiService,
      )
      .then(async () => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.waiveFinesSuccess'),
          life: 3000,
        });
        await userStore.fetchUserBalance(props.user.id, apiService);
        isVisible.value = false;
      })
      .catch((error) => {
        handleError(error, toast);
      });
  }),
);
</script>
