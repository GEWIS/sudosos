<template>
  <div class="flex flex-column">
    <span>
      {{ dateString }}
    </span>
    <span>{{ $t("transactions.invoiceDescr") }}</span>
    <br>
    <DataTable :value="[invoiceInfo]" :pt="{
          tfoot: 'font-bold'
        }">
      <Column field="description" :header="$t('transactions.depositID')" class="p-1">
        <template #body="invoice">
          <span class="text-sm xl:text-base">{{ invoiceInfo.description }}</span>
        </template>
      </Column>
      <Column field="totalPriceInclVat" :header="$t('transactions.amount')" class="p-1" footerClass="font-bold">
        <template #body="invoice">
          {{ formatPrice(invoiceInfo.amount) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { computed, onMounted } from "vue";
import { formatPrice } from "../../utils/formatterUtils";
import type { TransferResponse } from "@sudosos/sudosos-client";

const { invoiceInfo } = defineProps({
  invoiceInfo: {
    type: Object as () => TransferResponse,
    required: true,
  }
});

const dateString = computed(() => {
  return new Date(invoiceInfo.createdAt!!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
});

</script>
<style scoped lang="scss">
</style>
