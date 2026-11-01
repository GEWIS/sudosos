<template>
  <div class="flex flex-col gap-3">
    <DatePicker
      ref="datePicker"
      v-model="dates"
      :disabled="disabled"
      inline
      :manual-input="true"
      :pt="{
        day: (options) => {
          const dateString = `${options.context.date.year}-${options.context.date.month}-${options.context.date.day}`;
          if (transactionsPerDay[dateString]) {
            return {
              class: 'transaction-day-selected',
            };
          }
        },
      }"
      selection-mode="range"
      show-button-bar
      @clear-click="handleClear"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * Component which displays a calendar that can be used to select transactions.
 * Days with transactions are highlighted, based on the forId in the form context.
 */

import { computed, type ComputedRef, type PropType, type Ref, ref, watch } from 'vue';
import * as yup from 'yup';
import { type BaseTransactionResponse } from '@gewis/sudosos-client';
import { useToast } from 'openvue/usetoast';
import { type Form, getProperty } from '@/utils/formUtils';
import type { createInvoiceObject } from '@/utils/validation-schema';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});

const toast = useToast();

const dates = ref<(Date | null)[]>([]);
const selectedUser: ComputedRef<number | undefined> = computed(() => getProperty(props.form, 'forId'));
const isLoading: Ref<boolean> = ref(false);
// Only the latest transactions request may fill the form, so an older response (another user or range) is ignored.
let latestRequest = 0;

const disabled = computed(() => {
  return isLoading.value || loadingHeatmap.value || !getProperty(props.form, 'forId');
});

/**
 * Fetch transactions from the API.
 */
const getTransactions = () => {
  if (!selectedUser.value) return;
  if (!dates.value || dates.value.length !== 2 || !dates.value[0] || !dates.value[1]) return;

  isLoading.value = true;
  const request = ++latestRequest;

  // We set the form to 0 and the end to  23:59:59 to get all transactions in the selected date range.
  const fromDate = new Date(dates.value[0]);
  const toDate = new Date(dates.value[1]);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  apiService.invoices
    .getEligibleTransactions({
      forId: selectedUser.value,
      fromDate: fromDate.toISOString(),
      tillDate: toDate.toISOString(),
    })
    .then((res) => {
      if (request !== latestRequest) return;
      const t = res.data;
      const amount = t.reduce((sum, transaction) => sum + transaction.totalPriceInclVat.amount, 0);

      props.form.context.setFieldValue(
        'transactionIDs',
        t.map((transaction) => transaction.id),
      );
      props.form.context.setFieldValue('transactions', t);
      props.form.context.setFieldValue('transactionTotal', { precision: 2, currency: 'EUR', amount });
    })
    .catch((err) => {
      if (request === latestRequest) handleError(err, toast);
    })
    .finally(() => {
      if (request === latestRequest) isLoading.value = false;
    });
};

function handleClear() {
  latestRequest++;
  isLoading.value = false;
  dates.value = [];
  props.form.context.resetField('transactionIDs');
  props.form.context.resetField('transactions');
  props.form.context.resetField('transactionTotal');
}

/**
 * Show transactions if the form context has a forId and the dates are set.
 */
const showTransactions = () => {
  if (!dates.value || dates.value.length !== 2) return false;
  return selectedUser.value !== undefined && dates.value[0] !== null && dates.value[1] !== null;
};

/**
 * Fetch transactions when the dates change.
 */
watch(dates, () => {
  if (showTransactions()) getTransactions();
});

// Mapping between the date and the transactions
const transactionsPerDay = ref<{ [key: string]: boolean }>({});
const loadingHeatmap = ref(false);

// The DatePicker has no prop for the month it shows (it follows the selection, or today), so set its state directly.
const datePicker = ref<{ currentMonth: number; currentYear: number } | null>(null);

/**
 * Fetch all eligible transactions of the selected user and map them to the transactionsPerDay.
 * This is used to highlight days with transactions. When nothing is selected yet,
 * the calendar opens on the month of the latest transaction instead of the current month.
 */
const getTransactionsHeatMap = () => {
  const userId = selectedUser.value;
  if (!userId) return;
  loadingHeatmap.value = true;

  apiService.invoices
    .getEligibleTransactions({ forId: userId, fromDate: new Date(0).toISOString() })
    .then((res) => {
      // The user changed while this request was running.
      if (userId !== selectedUser.value) return;

      const t = res.data as unknown as BaseTransactionResponse[];
      let latest: Date | undefined;
      t.forEach((transaction: BaseTransactionResponse) => {
        // Local time throughout, with a 0-based month, to match the DatePicker's day context.
        const date = new Date(transaction.createdAt as string);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        transactionsPerDay.value[dateKey] = true;
        if (!latest || date > latest) latest = date;
      });

      if (latest && datePicker.value && !showTransactions()) {
        datePicker.value.currentMonth = latest.getMonth();
        datePicker.value.currentYear = latest.getFullYear();
      }
    })
    .catch((err) => {
      if (userId === selectedUser.value) handleError(err, toast);
    })
    .finally(() => {
      if (userId === selectedUser.value) loadingHeatmap.value = false;
    });
};

/**
 * Reset the heatmap.
 */
const clearHeatmap = () => {
  transactionsPerDay.value = {};
};

/**
 * Clear the date range, the transactions and the heatmap when the selected user changes,
 * so the form never holds transactions of another user.
 * Immediate, because the user can already be set before mount (e.g. via the `userId` query).
 */
watch(
  selectedUser,
  () => {
    handleClear();
    clearHeatmap();

    if (selectedUser.value) getTransactionsHeatMap();
  },
  { immediate: true },
);
</script>

<style lang="scss">
// The badge tokens only exist once a Badge has rendered on the page, so fall back to the same palette colours.
.p-datepicker-day.transaction-day-selected {
  background-color: var(--p-badge-info-background, var(--p-sky-500)) !important;
  color: var(--p-badge-info-color, var(--p-surface-0)) !important;
}

.p-datepicker-day.transaction-day-selected.p-datepicker-day-selected-range,
.p-datepicker-day.p-datepicker-day-selected.transaction-day-selected {
  background-color: var(--p-badge-success-background, var(--p-green-500)) !important;
  color: var(--p-badge-success-color, var(--p-surface-0)) !important;
}
</style>
