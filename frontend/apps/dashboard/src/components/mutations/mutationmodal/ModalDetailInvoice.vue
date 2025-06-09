<template>
  <div class="flex flex-col">
    <span>
      {{ dateString }}
    </span>
    <span>{{ t('components.mutations.modal.invoiceDescription') }}</span>
    <br />
    <DataTable
      :pt="{
        tfoot: 'font-bold',
      }"
      :value="[invoiceInfo]"
    >
      <Column class="p-1" field="description" :header="t('common.id')">
        <template #body="">
          <span class="text-sm xl:text-base">{{ invoiceInfo.description }}</span>
        </template>
      </Column>
      <Column class="p-1" field="totalPriceInclVat" footer-class="font-bold" :header="t('common.amount')">
        <template #body="">
          {{ formatPrice(invoiceInfo.amount) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { computed } from 'vue';
import type { TransferResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';

const { t } = useI18n();

const { invoiceInfo } = defineProps({
  invoiceInfo: {
    type: Object as () => TransferResponse,
    required: true,
  },
});

const dateString = computed(() => {
  return new Date(invoiceInfo.createdAt!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
});
</script>
<style scoped lang="scss"></style>
