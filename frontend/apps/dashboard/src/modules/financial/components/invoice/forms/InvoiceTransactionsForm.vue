<template>
  <div class="flex flex-column gap-3">
    <Calendar v-model="dates" inline showButtonBar :disabled="disabled" :key="transactionCalendar"
              selectionMode="range" :manualInput="true" @clear-click="form.context.resetForm()" :pt='{
      day: (options) => {
        const dateString = `${options.context.date.year}-${options.context.date.month}-${options.context.date.day}`;
        if (transactionsPerDay[dateString]) {
          return {
            class: "transaction-day-selected",
          }
        }
      }
    }' @month-change="monthChange($event)"/>

    {{ t('modules.financial.invoice.create.pos') }}
    <span class="font-bold">{{ includedPOSString }}</span>
  </div>
</template>

<script setup lang="ts">
/**
 * Component which displays a calendar that can be used to select transactions.
 * Days with transactions are highlighted, based on the forId in the form context.
 */

import { useI18n } from "vue-i18n";
import type { createInvoiceObject } from "@/utils/validation-schema";
import { computed, type ComputedRef, type PropType, type Ref, ref, watch } from "vue";
import * as yup from "yup";
import { type Form, getProperty } from "@/utils/formUtils";
import { type BasePointOfSaleResponse, type BaseTransactionResponse } from "@sudosos/sudosos-client";
import apiService from "@/services/ApiService";

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});

const dates = ref<(Date|null)[]>([]);
const transactions: Ref<BaseTransactionResponse[]>= ref([]);
const transactionCalendar = ref(0);
const includedPOS: Ref<{ [key: number]: BasePointOfSaleResponse }> = ref({});
const selectedUser: ComputedRef<number | undefined> = computed(() => getProperty(props.form, "forId"));
const isLoading: Ref<boolean> = ref(false);

const disabled = computed(() => {
  return isLoading.value || loadingHeatmap.value || !getProperty(props.form, "forId");
});

/**
 * Fetch transactions from the API.
 */
const getTransactions = () => {
  if (!selectedUser.value) return;
  if (!dates.value || dates.value.length !== 2
    || !dates.value[0] || !dates.value[1]) return;

  isLoading.value = true;

  // We set the form to 0 and the end to  23:59:59 to get all transactions in the selected date range.
  const fromDate = new Date(dates.value[0]);
  const toDate = new Date(dates.value[1]);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(23, 59, 59, 999);

  props.form.context.resetField('transactionTotal');
  apiService.invoices.getEligibleTransactions(selectedUser.value, fromDate.toISOString(),
      toDate.toISOString()).then((res) => {
    const t = res.data as any as BaseTransactionResponse[];

    transactions.value = t;
    includedPOS.value = {};

    const transactionsIds: number[] = [];
    t.forEach((transaction: BaseTransactionResponse) => {
      // eslint-disable-next-line vue/no-mutating-props
      props.form.model.transactionTotal.value.value.amount += (transaction as any).totalPriceInclVat.amount;
      includedPOS.value[transaction.pointOfSale.id] = transaction.pointOfSale;
      transactionsIds.push(transaction.id);
    });
    props.form.context.setFieldValue('transactionIDs', transactionsIds);
  }).finally(() => {
    isLoading.value = false;
  });
};

/**
 * Show transactions if the form context has a forId and the dates are set.
 */
const showTransactions = () => {
  if (!dates.value || dates.value.length !== 2) return false;
  return selectedUser.value !== undefined && dates.value[0] !== null && dates.value[1] !== null;
};

/**
 * Clear the transactions and reset the heatmap when the selected user changes.
 */
watch(selectedUser, () => {
  clear();

  if (selectedUser.value) {
    const now = new Date();
    getTransactionsHeatMap({ month: now.getMonth() + 1, year: now.getFullYear() });
  }
  if (showTransactions()) getTransactions();
  else transactions.value = [];
});

/**
 * Fetch transactions when the dates change.
 */
watch(dates, () => {
  if (showTransactions()) getTransactions();
  else transactions.value = [];
});

// Mapping between the date and the transactions
const transactionsPerDay = ref<{ [key: string]: boolean }>({});
const loadingHeatmap = ref(false);

/**
 * Fetch transactions for the selected month and year and map them to the transactionsPerDay.
 * This is used to highlight days with transactions.
 * @param event
 */
const getTransactionsHeatMap = (event: { month: number, year: number }) => {
  if (!selectedUser.value) return;
  loadingHeatmap.value = true;

  // Similar to `getTransactions` we set the form to 0
  // and the end to 23:59:59 to get all transactions in the selected date range.
  const fromDate = new Date(event.year, event.month-1, 1);
  const toDate = new Date(event.year, event.month, 0);
  fromDate.setHours(0, 0, 0, 0);
  toDate.setHours(0, 0, 0, 0);

  apiService.invoices.getEligibleTransactions(selectedUser.value,
      fromDate.toISOString(), toDate.toISOString()).then((res) => {
        const t = res.data as any as BaseTransactionResponse[];
        t.forEach((transaction: BaseTransactionResponse) => {
          const date = new Date(transaction.createdAt as string);
          const dateKey = `${date.getFullYear()}-${date.getUTCMonth()}-${date.getDate()}`;
          transactionsPerDay.value[dateKey] = true;
        });
  }).finally(() => {
    loadingHeatmap.value = false;
  });
};

/**
 * Fetch transactions for the selected month and year and map them to the transactionsPerDay.
 * @param event
 */
const monthChange = (event: { month: number, year: number }) => {
  getTransactionsHeatMap(event);
};

/**
 * Clear the transactions and reset the heatmap.
 */
const clear = () => {
  transactions.value = [];
  transactionsPerDay.value = {};
};

/**
 * Get a string of all included POS.
 */
const includedPOSString = computed(() => {
  return Object.values(includedPOS.value).map((p: BasePointOfSaleResponse) => `${p.name} (id ${p.id})`).join(", ");
});
</script>

<style lang="scss">
    .p-datepicker table td.transaction-day-selected > span {
      background-color: rgba(11, 114, 0, 0.89) !important;
      color: white !important;
      font-weight: bold;
    }

    .p-datepicker table td.transaction-day-selected > span.p-highlight {
      border-color: #D40000 !important;
      border-width: 3px !important;
    }
</style>
