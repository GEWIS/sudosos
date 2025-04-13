<template>
  <div class="flex flex-column">
    <span>
      {{ dateString }}
    </span>
    <span>{{ t('components.mutations.modal.depositDescription') }}</span>
    <br />
    <DataTable
      :pt="{
        tfoot: 'font-bold',
      }"
      :value="[depositInfo]"
    >
      <Column class="p-1" field="description" :header="t('common.id')">
        <template #body="">
          <span class="text-sm xl:text-base">{{ depositInfo.description }}</span>
        </template>
      </Column>
      <Column class="p-1" field="totalPriceInclVat" footer-class="font-bold" :header="t('common.amount')">
        <template #body="">
          {{ formatPrice(depositInfo.amount) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import type { TransferResponse } from '@sudosos/sudosos-client';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';

const { t } = useI18n();

const { depositInfo } = defineProps({
  depositInfo: {
    type: Object as () => TransferResponse,
    required: true,
  },
});

const dateString = computed(() => {
  return new Date(depositInfo.createdAt!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
});
</script>
