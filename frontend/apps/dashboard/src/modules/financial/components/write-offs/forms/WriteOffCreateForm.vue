<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputUserSpan
      id="name"
      :default="form.model.user.value.value"
      :disabled="disabled"
      :errors="form.context.errors.value.user"
      :label="t('modules.financial.forms.payout.for')"
      placeholder="John Doe"
      :show-positive="true"
      :value="form.model.user.value.value"
      @update:value="form.context.setFieldValue('user', $event)"
    />

    <skeleton v-if="userBalance === null && form.model.user.value.value" class="w-6 my-1 h-0.5rem surface-300" />
    <div
      v-else-if="userBalance"
      class="flex flex-row gap-1"
      :class="{ 'text-gray-700': !balanceError, 'text-red-500 font-bold': balanceError }"
    >
      <span>
        {{ t('modules.financial.forms.payout.currentBalance', { balance: formatPrice(userBalance.amount) }) }}</span
      >
    </div>

    <div class="flex w-full justify-content-end">
      <ErrorSpan :error="form.context.errors.value.balance" />
    </div>

    {{ t('modules.financial.forms.write-off.warning') }}
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, type Ref, watch } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import type { BalanceResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { type createWriteOffSchema } from '@/utils/validation-schema';
import type { Form } from '@/utils/formUtils';
import { setSubmit } from '@/utils/formUtils';
import InputUserSpan from '@/components/InputUserSpan.vue';
import { formatPrice } from '@/utils/formatterUtils';
import apiService from '@/services/ApiService';
import ErrorSpan from '@/components/ErrorSpan.vue';
import { useWriteOffStore } from '@/stores/writeoff.store';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const toast = useToast();
const writeOffStore = useWriteOffStore();

const emit = defineEmits(['submit:success', 'submit:error']);

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createWriteOffSchema>>>,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const userBalance: Ref<BalanceResponse | null | undefined> = ref(null);
const balanceError = ref<string>('');
watch(
  () => props.form.model.user.value.value,
  () => {
    console.info('updated:', props.form.model.user.value.value);
    if (props.form.model.user.value.value.id) {
      apiService.balance
        .getBalanceId(props.form.model.user.value.value.id)
        .then((res) => {
          userBalance.value = res.data;
          props.form.context.setFieldValue('balance', userBalance.value.amount.amount);
        })
        .catch(() => {
          userBalance.value = undefined;
        });
    }
  },
);

const validateAmount = () => {
  if (userBalance.value && userBalance.value.amount.amount >= 0) {
    props.form.context.setErrors({ balance: balanceError.value });
  }
};

watch(
  () => userBalance.value,
  () => {
    validateAmount();
  },
);

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    writeOffStore
      .createWriteOff({ toId: values.user.id })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.writeOffCreated'),
          detail: t('common.toast.success.writeOffCreated'),
          life: 3000,
        });
        emit('submit:success', values);
      })
      .catch((err) => {
        handleError(err, toast);
        emit('submit:error', err);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
