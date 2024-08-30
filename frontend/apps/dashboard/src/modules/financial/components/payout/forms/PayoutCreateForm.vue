<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputUserSpan :label="t('payout.For')"
                   :value="form.model.user.value.value"
                   @update:value="form.context.setFieldValue('user', $event)"
                   :errors="form.context.errors.value.user"
                   id="name" placeholder="John Doe" type="text"/>

    <skeleton v-if="userBalance === null && form.model.user.value.value" class="w-6 my-1 h-0.5rem surface-300"/>
    <div v-else-if="userBalance" class="flex flex-row gap-1"
         :class="{'text-gray-700': !balanceError, 'text-red-500 font-bold': balanceError}">
      <span>{{ t('payout.Current balance', { balance: formatPrice(userBalance.amount) }) }}</span>
    </div>

    <InputSpan :label="t('payout.BankAccountNumber')"
               :value="form.model.bankAccountNumber.value.value"
               :attributes="form.model.bankAccountNumber.attr.value"
               @update:value="form.context.setFieldValue('bankAccountNumber', $event)"
               :errors="form.context.errors.value.bankAccountNumber"
               id="name" placeholder="NL69 ABNA 0012 3456 78" type="text"/>

    <InputSpan :label="t('payout.BankAccountName')"
               :value="form.model.bankAccountName.value.value"
               :attributes="form.model.bankAccountName.attr.value"
               @update:value="form.context.setFieldValue('bankAccountName', $event)"
               :errors="form.context.errors.value.bankAccountName"
               id="name" placeholder="John Doe" type="text"/>

    <InputSpan :label="t('payout.Amount')"
               :value="form.model.amount.value.value"
               :attributes="form.model.amount.attr.value"
               @update:value="form.context.setFieldValue('amount', $event)"
               :errors="form.context.errors.value.amount"
               id="name" placeholder="Amount" type="currency"/>

    <div class="flex w-full justify-content-end">
      <ErrorSpan :error="balanceError"/>
    </div>

  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, type Ref, watch } from "vue";
import * as yup from "yup";
import { useI18n } from "vue-i18n";
import { usePayoutStore } from "@/stores/payout.store";
import apiService from "@/services/ApiService";
import type { BalanceResponse, PayoutRequestRequest } from "@sudosos/sudosos-client";
import type { createPayoutSchema } from "@/utils/validation-schema";
import type { Form } from "@/utils/formUtils";
import { setSubmit } from "@/utils/formUtils";
import { formatPrice } from "@/utils/formatterUtils";
import ErrorSpan from "@/components/ErrorSpan.vue";
import { useToast } from "primevue/usetoast";
import InputSpan from "@/components/InputSpan.vue";
import InputUserSpan from "@/components/InputUserSpan.vue";
import { handleError } from "@/utils/errorUtils";

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
    balanceError.value = `${t('payout.AmountToHigh')}`;
  } else {
    balanceError.value = ''; // Clear error if valid
  }
};

watch(() => userBalance.value, () => {
  validateAmount();
});

watch(() => props.form.model.amount.value.value, () => {
  validateAmount();
});

// fetch user balance when selected user changes
watch(() => props.form.model.user.value.value, () => {
  if (props.form.model.user.value.value.id) {
    apiService.balance.getBalanceId(props.form.model.user.value.value.id).then((res) => {
      userBalance.value = res.data;
    }).catch(() => {
      userBalance.value = undefined;
    });
  }
});

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
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
  await payoutStore.createPayout(request).then(() => {
    emit('submit:success', request);
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.payoutCreated'),
      life: 3000,
    });
    props.form.context.resetForm();
  }).catch((err) => {
    emit('submit:error', err);
    handleError(err, toast);
  });
}));

</script>

<style scoped lang="scss">

</style>
