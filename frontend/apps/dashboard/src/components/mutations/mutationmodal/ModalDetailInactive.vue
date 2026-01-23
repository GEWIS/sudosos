<template>
  <div class="flex flex-col">
    <span>
      {{ dateString }}
    </span>
    <span>
      {{ t('modules.financial.administrative.details.userInfo') }}:
      <UserLink :new-tab="true" :user="inactiveInfo.from" />
    </span>
    <br />
    <DataTable
      :pt="{
        tfoot: 'font-bold',
      }"
      :value="[inactiveInfo]"
    >
      <Column class="p-1" field="id" :header="t('common.id')">
        <template #body="">
          <span class="text-sm xl:text-base">{{ inactiveInfo.id }}</span>
        </template>
      </Column>
      <Column class="p-1" field="amount" footer-class="font-bold" :header="t('common.amount')">
        <template #body="">
          {{ formatDineroObject(inactiveInfo.amount) }}
        </template>
      </Column>
    </DataTable>
    <div v-if="inactiveInfo.transfer" class="mt-4">
      <span class="font-bold">{{ t('modules.financial.administrative.details.transferInfo') }}</span>
      <div class="mt-2">
        <span>{{ t('common.id') }}: {{ inactiveInfo.transfer.id }}</span>
        <div v-if="inactiveInfo.transfer.description">
          <span>{{ t('common.description') }}: {{ inactiveInfo.transfer.description }}</span>
        </div>
        <div v-if="inactiveInfo.transfer.createdAt">
          <span>{{ t('common.date') }}: {{ formatDateFromString(inactiveInfo.transfer.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { computed } from 'vue';
import type { BaseInactiveAdministrativeCostResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { formatDineroObject, formatDateFromString } from '@/utils/formatterUtils';
import UserLink from '@/components/UserLink.vue';

const { t } = useI18n();

const { inactiveInfo } = defineProps({
  inactiveInfo: {
    type: Object as () => BaseInactiveAdministrativeCostResponse,
    required: true,
  },
});

const dateString = computed(() => {
  return new Date(inactiveInfo.createdAt!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
});
</script>
<style scoped lang="scss"></style>
