<template>
  <div class="flex flex-col">
    <span>{{ dateString }}</span>
    <span>{{ t('components.mutations.modal.sellerPayoutDescription') }}</span>
    <br />
    <DataTable :value="[sellerPayout]">
      <Column class="p-1" field="description" :header="t('common.description')">
        <template #body="">
          <span class="text-sm xl:text-base">{{ sellerPayout.description }}</span>
        </template>
      </Column>
      <Column class="p-1" :header="t('common.amount')">
        <template #body="">
          {{ formatPrice(sellerPayout.amount) }}
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

const { sellerPayout } = defineProps<{
  sellerPayout: TransferResponse;
}>();

const dateString = computed(() => {
  return new Date(sellerPayout.createdAt!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
});
</script>
