<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <Dialog
    v-model:visible="visible"
    class="w-full max-w-lg"
    :draggable="false"
    :header="
      isEdit ? t('modules.financial.vouchers.dialog.editTitle') : t('modules.financial.vouchers.dialog.createTitle')
    "
    modal
  >
    <form class="flex flex-col gap-4 pt-2" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-1">
        <label class="font-medium" for="voucher-name">
          {{ t('modules.financial.vouchers.dialog.name') }}
          <span class="text-red-500">{{ '*' }}</span>
        </label>
        <InputText
          id="voucher-name"
          v-model="name"
          :invalid="submitted && !isNameValid"
          :placeholder="t('modules.financial.vouchers.dialog.namePlaceholder')"
        />
        <small v-if="submitted && !isNameValid" class="text-red-500">
          {{ t('modules.financial.vouchers.dialog.errors.nameRequired') }}
        </small>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="font-medium" for="voucher-start-date">
            {{ t('modules.financial.vouchers.dialog.startDate') }}
            <span class="text-red-500">{{ '*' }}</span>
          </label>
          <DatePickerString
            id="voucher-start-date"
            v-model="startDate"
            fluid
            :invalid="submitted && !isStartDateValid"
            show-icon
          />
          <small v-if="submitted && !isStartDateValid" class="text-red-500">
            {{ t('modules.financial.vouchers.dialog.errors.startDateRequired') }}
          </small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="font-medium" for="voucher-end-date">
            {{ t('modules.financial.vouchers.dialog.endDate') }}
            <span class="text-red-500">{{ '*' }}</span>
          </label>
          <DatePickerString
            id="voucher-end-date"
            v-model="endDate"
            fluid
            :invalid="submitted && !isEndDateValid"
            show-icon
          />
          <small v-if="submitted && !isEndDateValid" class="text-red-500">
            {{ endDateError }}
          </small>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label class="font-medium" for="voucher-amount">
            {{ t('modules.financial.vouchers.dialog.amount') }}
            <span class="text-red-500">{{ '*' }}</span>
          </label>
          <InputNumber
            id="voucher-amount"
            v-model="amount"
            fluid
            :invalid="submitted && !isAmountValid"
            :min="minAmount"
            :show-buttons="true"
          />
          <small v-if="submitted && !isAmountValid" class="text-red-500">
            {{ t('modules.financial.vouchers.dialog.errors.amountMin') }}
          </small>
        </div>

        <div class="flex flex-col gap-1">
          <label class="font-medium" for="voucher-balance">
            {{ t('modules.financial.vouchers.dialog.balance') }}
            <span class="text-red-500">{{ '*' }}</span>
          </label>
          <InputNumber
            id="voucher-balance"
            v-model="balanceEuros"
            currency="EUR"
            fluid
            :invalid="submitted && !isBalanceValid"
            locale="nl-NL"
            :max-fraction-digits="2"
            :min="0.01"
            :min-fraction-digits="2"
            mode="currency"
          />
          <small v-if="submitted && !isBalanceValid" class="text-red-500">
            {{ t('modules.financial.vouchers.dialog.errors.balanceMin') }}
          </small>
        </div>
      </div>

      <p class="text-sm text-muted-color">
        {{ t('modules.financial.vouchers.dialog.help') }}
      </p>

      <div class="flex justify-end gap-2 mt-4">
        <Button
          :label="t('modules.financial.vouchers.dialog.cancel')"
          outlined
          severity="secondary"
          type="button"
          @click="visible = false"
        />
        <Button :label="t('modules.financial.vouchers.dialog.save')" :loading="isSaving" type="submit" />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import type { VoucherGroupRequest, VoucherGroupResponse } from '@gewis/sudosos-client';
import DatePickerString from '@/components/DatePickerString.vue';
import { useVoucherGroupStore } from '@/stores/voucherGroup.store';
import { handleError } from '@/utils/errorUtils';
import { formatDateFromString } from '@/utils/formatterUtils';

const { t } = useI18n();
const toast = useToast();
const voucherGroupStore = useVoucherGroupStore();

const visible = defineModel<boolean>('visible', { required: true, default: false });
const props = defineProps<{
  voucherGroup?: VoucherGroupResponse | null;
}>();

const emit = defineEmits<{
  (e: 'saved', group: VoucherGroupResponse): void;
}>();

const isEdit = computed(() => Boolean(props.voucherGroup?.id));
const minAmount = computed(() => (isEdit.value && props.voucherGroup ? props.voucherGroup.amount : 1));

const name = ref('');
// Dates are YYYY-MM-DD strings, like the payout forms; the backend expands them to the start and end of the day
const today = () => formatDateFromString(new Date().toISOString());
const inAWeek = () => formatDateFromString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());

const startDate = ref(today());
const endDate = ref(inAWeek());
const amount = ref<number>(10);
const balanceEuros = ref<number>(10);
const isSaving = ref(false);
const submitted = ref(false);

const resetForm = () => {
  submitted.value = false;
  if (props.voucherGroup) {
    name.value = props.voucherGroup.name;
    startDate.value = formatDateFromString(props.voucherGroup.activeStartDate) || today();
    endDate.value = formatDateFromString(props.voucherGroup.activeEndDate);
    amount.value = props.voucherGroup.amount;
    balanceEuros.value = props.voucherGroup.balance.amount / 10 ** props.voucherGroup.balance.precision;
  } else {
    name.value = '';
    startDate.value = today();
    endDate.value = inAWeek();
    amount.value = 10;
    balanceEuros.value = 10;
  }
};

watch(
  () => visible.value,
  (isOpen) => {
    if (isOpen) {
      resetForm();
    }
  },
);

const isNameValid = computed(() => name.value.trim().length > 0);
// YYYY-MM-DD strings compare correctly as plain strings
const isStartDateValid = computed(() => startDate.value.length > 0);
const endDateError = computed(() => {
  if (!endDate.value) return t('modules.financial.vouchers.dialog.errors.endDateRequired');
  if (endDate.value < today()) return t('modules.financial.vouchers.dialog.errors.endDatePast');
  if (startDate.value && endDate.value <= startDate.value) {
    return t('modules.financial.vouchers.dialog.errors.endDateBeforeStart');
  }
  return '';
});
const isEndDateValid = computed(() => endDateError.value === '');

const isAmountValid = computed(() => typeof amount.value === 'number' && amount.value >= minAmount.value);
const isBalanceValid = computed(() => typeof balanceEuros.value === 'number' && balanceEuros.value > 0);

const isFormValid = computed(
  () =>
    isNameValid.value && isStartDateValid.value && isEndDateValid.value && isAmountValid.value && isBalanceValid.value,
);

const handleSubmit = async () => {
  submitted.value = true;
  if (!isFormValid.value || !startDate.value || !endDate.value) return;

  isSaving.value = true;
  try {
    const payload: VoucherGroupRequest = {
      name: name.value.trim(),
      activeStartDate: startDate.value,
      activeEndDate: endDate.value,
      amount: amount.value,
      balance: {
        amount: Math.round(balanceEuros.value * 100),
        currency: 'EUR',
        precision: 2,
      },
    };

    let result: VoucherGroupResponse;
    if (isEdit.value && props.voucherGroup) {
      result = await voucherGroupStore.updateVoucherGroup(props.voucherGroup.id, payload);
      toast.add({
        severity: 'success',
        summary: t('modules.financial.vouchers.dialog.toast.updateSuccess'),
        life: 3000,
      });
    } else {
      result = await voucherGroupStore.createVoucherGroup(payload);
      toast.add({
        severity: 'success',
        summary: t('modules.financial.vouchers.dialog.toast.createSuccess'),
        life: 3000,
      });
    }

    visible.value = false;
    emit('saved', result);
  } catch (error) {
    handleError(error as AxiosError, toast);
  } finally {
    isSaving.value = false;
  }
};
</script>
