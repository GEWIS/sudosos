<template>
  <div class="flex flex-col">
    <span>
      {{ dateString }}
    </span>
    <span>{{ t('components.mutations.modal.inactiveCostDescription') }}</span>
    <span class="text-sm text-gray-600 mt-1">{{ t('components.mutations.modal.inactiveCostExplanation') }}</span>
    <br />
    <DataTable
      :pt="{
        tfoot: 'font-bold',
      }"
      :value="[inactiveInfo]"
    >
      <Column class="p-1" field="description" :header="t('common.description')">
        <template #body="">
          <span class="text-sm xl:text-base">
            {{ inactiveInfo.transfer?.description || `InactiveAdministrativeCost Transfer` }}
          </span>
        </template>
      </Column>
      <Column class="p-1" field="id" :header="t('common.id')">
        <template #body="">
          <span class="text-sm xl:text-base">{{ inactiveInfo.id }}</span>
        </template>
      </Column>
      <Column class="p-1" field="amount" footer-class="font-bold" :header="t('common.amount')">
        <template #body="">
          {{ formatPrice(inactiveInfo.amount) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { computed } from 'vue';
import type { BaseInactiveAdministrativeCostResponse, TransferResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';

interface InactiveAdministrativeCostWithTransfer extends BaseInactiveAdministrativeCostResponse {
  transfer?: TransferResponse;
}

const { t } = useI18n();

const { inactiveInfo } = defineProps<{
  inactiveInfo: InactiveAdministrativeCostWithTransfer;
}>();

const dateString = computed(() => {
  return new Date(inactiveInfo.createdAt!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
});
</script>
<style scoped lang="scss"></style>
