<template>
  <div class="flex flex-col gap-4">
    <InputUserSpan
      id="name"
      column
      :errors="form.context.errors.value.user"
      label=""
      placeholder="John Doe"
      :show-positive="true"
      :value="form.model.user.value.value"
      @update:value="form.context.setFieldValue('user', $event)"
    />

    <InputSpan
      id="name"
      class="max-w-[13rem]"
      v-bind="form.model.balance.attr.value"
      :disabled="true"
      :errors="form.context.errors.value.balance"
      :label="t('modules.user.balance.balance')"
      :placeholder="t('modules.user.balance.balance')"
      type="currency"
      :value="form.model.balance.value.value"
    />

    <InputSpan
      id="name"
      class="max-w-[13rem]"
      v-bind="form.model.amount.attr.value"
      :errors="form.context.errors.value.amount"
      :label="t('common.amount')"
      :placeholder="t('common.amount')"
      type="currency"
      :value="form.model.amount.value.value"
      @update:value="form.context.setFieldValue('amount', $event)"
    />

    <InputSpan
      id="bankAccountNumber"
      class="max-w-[13rem]"
      v-bind="form.model.bankAccountNumber.attr.value"
      :errors="form.context.errors.value.bankAccountNumber"
      :label="t('modules.financial.forms.payout.bankAccountNumber')"
      :placeholder="t('common.placeholders.bankAccountNumber')"
      type="text"
      :value="form.model.bankAccountNumber.value.value"
      @update:value="form.context.setFieldValue('bankAccountNumber', $event)"
    />

    <InputSpan
      id="bankAccountName"
      class="max-w-[13rem]"
      v-bind="form.model.bankAccountName.attr.value"
      :errors="form.context.errors.value.bankAccountName"
      :label="t('modules.financial.forms.payout.bankAccountName')"
      :placeholder="t('common.placeholders.fullName')"
      type="text"
      :value="form.model.bankAccountName.value.value"
      @update:value="form.context.setFieldValue('bankAccountName', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { type PropType, watch } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import type { PayoutRequestRequest } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { usePayoutStore } from '@/stores/payout.store';
import apiService from '@/services/ApiService';
import type { createPayoutSchema } from '@/utils/validation-schema';
import type { Form } from '@/utils/formUtils';
import { setSubmit } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import InputUserSpan from '@/components/InputUserSpan.vue';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const toast = useToast();
const payoutStore = usePayoutStore();

const emit = defineEmits(['submit:success', 'submit:error']);

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createPayoutSchema>>>,
    required: true,
  },
});

// fetch user balance when selected user changes
watch(
  () => props.form.model.user.value.value,
  () => {
    if (props.form.model.user.value.value.id) {
      apiService.balance
        .getBalanceId(props.form.model.user.value.value.id)
        .then((res) => {
          const numericBalance = res.data.amount.amount / 100;
          props.form.context.setFieldValue('balance', numericBalance);
        })
        .catch(() => {
          props.form.context.setFieldValue('balance', 0);
        });
    }
  },
);

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    const request: PayoutRequestRequest = {
      amount: {
        amount: Math.round(values.amount * 100),
        precision: 2,
        currency: 'EUR',
      },
      bankAccountName: values.bankAccountName,
      bankAccountNumber: values.bankAccountNumber,
      forId: props.form.model.user.value.value.id,
    };
    payoutStore
      .createPayout(request)
      .then(() => {
        emit('submit:success', request);
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.payoutCreated'),
          life: 3000,
        });
        props.form.context.resetForm();
      })
      .catch((err) => {
        emit('submit:error', err);
        handleError(err, toast);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
