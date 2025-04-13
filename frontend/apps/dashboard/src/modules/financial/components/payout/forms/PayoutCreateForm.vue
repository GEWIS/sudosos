<template>
  <div class="flex flex-column gap-2 justify-content-between">
    <InputUserSpan
      id="name"
      :errors="form.context.errors.value.user"
      :label="t('modules.financial.forms.payout.for')"
      placeholder="John Doe"
      :show-positive="true"
      :value="form.model.user.value.value"
      @update:value="form.context.setFieldValue('user', $event)"
    />

    <!-- TODO think about turning this into a component? -->
    <skeleton v-if="userBalance === null && form.model.user.value.value" class="h-0.5rem my-1 surface-300 w-6" />
    <div
      v-else-if="userBalance"
      class="flex flex-row gap-1"
      :class="{ 'text-gray-700': !balanceError, 'text-red-500 font-bold': balanceError }"
    >
      <span>
        {{ t('modules.financial.forms.payout.currentBalance', { balance: formatPrice(userBalance.amount) }) }}</span
      >
    </div>

    <InputSpan
      id="name"
      :attributes="form.model.bankAccountNumber.attr.value"
      :errors="form.context.errors.value.bankAccountNumber"
      :label="t('modules.financial.forms.payout.bankAccountNumber')"
      :placeholder="t('common.placeholders.bankAccountNumber')"
      type="text"
      :value="form.model.bankAccountNumber.value.value"
      @update:value="form.context.setFieldValue('bankAccountNumber', $event)"
    />

    <InputSpan
      id="name"
      :attributes="form.model.bankAccountName.attr.value"
      :errors="form.context.errors.value.bankAccountName"
      :label="t('modules.financial.forms.payout.bankAccountName')"
      :placeholder="t('common.placeholders.fullName')"
      type="text"
      :value="form.model.bankAccountName.value.value"
      @update:value="form.context.setFieldValue('bankAccountName', $event)"
    />

    <InputSpan
      id="name"
      :attributes="form.model.amount.attr.value"
      :errors="form.context.errors.value.amount"
      :label="t('common.amount')"
      :placeholder="t('common.amount')"
      type="currency"
      :value="form.model.amount.value.value"
      @update:value="form.context.setFieldValue('amount', $event)"
    />

    <div class="flex justify-content-end w-full">
      <ErrorSpan :error="balanceError" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, type Ref, watch } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import type { BalanceResponse, PayoutRequestRequest } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { usePayoutStore } from '@/stores/payout.store';
import apiService from '@/services/ApiService';
import type { createPayoutSchema } from '@/utils/validation-schema';
import type { Form } from '@/utils/formUtils';
import { setSubmit } from '@/utils/formUtils';
import { formatPrice } from '@/utils/formatterUtils';
import ErrorSpan from '@/components/ErrorSpan.vue';
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

const userBalance: Ref<BalanceResponse | null | undefined> = ref(null);
const balanceError = ref<string>('');

const validateAmount = () => {
  if (userBalance.value && props.form.model.amount.value.value > userBalance.value.amount.amount / 100) {
    balanceError.value = `${t('modules.financial.forms.payout.amountTooHigh')}`;
  } else {
    balanceError.value = ''; // Clear error if valid
  }
};

watch(
  () => userBalance.value,
  () => {
    validateAmount();
  },
);

watch(
  () => props.form.model.amount.value.value,
  () => {
    validateAmount();
  },
);

// fetch user balance when selected user changes
watch(
  () => props.form.model.user.value.value,
  () => {
    if (props.form.model.user.value.value.id) {
      apiService.balance
        .getBalanceId(props.form.model.user.value.value.id)
        .then((res) => {
          userBalance.value = res.data;
        })
        .catch(() => {
          userBalance.value = undefined;
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
