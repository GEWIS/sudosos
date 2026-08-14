<template>
  <MutationsTable ref="tableRef" :fetch-page="fetchPage" :paginator="paginator" :rows-amount="rowsAmount">
    <template #columns="{ isLoading }">
      <Column field="type" :header="t('components.mutations.type')">
        <template v-if="isLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-6" />
        </template>
        <template v-else #body="mutation">
          {{ getDescription(mutation.data) }}
        </template>
      </Column>
    </template>
  </MutationsTable>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import type { PaginatedTransferResponse, TransferResponse } from '@gewis/sudosos-client';
import { useI18n } from 'vue-i18n';
import { getDescription, parseTransfer } from '@/utils/mutationUtils';
import MutationsTable from '@/components/mutations/MutationsTable.vue';

const { t } = useI18n();

const props = defineProps<{
  getTransfers: (take: number, skip: number) => Promise<PaginatedTransferResponse | undefined>;
  paginator?: boolean;
  rowsAmount?: number;
}>();

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const tableRef = ref<InstanceType<typeof MutationsTable> | null>(null);

async function fetchPage(take: number, skip: number) {
  const result = await props.getTransfers(take, skip);
  if (!result) return undefined;
  return {
    rows: result.records.map((t: TransferResponse) => parseTransfer(t)),
    total: result._pagination.count || 0,
  };
}

function refresh() {
  return tableRef.value?.refresh();
}

defineExpose({ refresh });
</script>
<style lang="scss" scoped></style>
