<template>
  <MutationsTable ref="tableRef" data-key="id" :fetch-page="fetchPage" :paginator="paginator" :rows-amount="rowsAmount">
    <template #columns="{ isLoading }">
      <Column field="createdFor" :header="t('components.mutations.createdFor')">
        <template v-if="isLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-6" />
        </template>
        <template v-else #body="mutation">
          {{ mutation.data.from?.firstName }}
        </template>
      </Column>

      <Column class="hidden sm:block" field="mutationPOS" :header="t('components.mutations.pos')">
        <template v-if="isLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-6" />
        </template>
        <template v-else #body="mutation">
          {{ mutation.data.pos }}
        </template>
      </Column>
    </template>
  </MutationsTable>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import type { PaginatedBaseTransactionResponse } from '@gewis/sudosos-client';
import { useI18n } from 'vue-i18n';
import { parseFinancialMutations } from '@/utils/mutationUtils';
import MutationsTable from '@/components/mutations/MutationsTable.vue';

const { t } = useI18n();

const props = defineProps<{
  getMutations: (take: number, skip: number) => Promise<PaginatedBaseTransactionResponse | undefined>;
  paginator?: boolean;
  rowsAmount?: number;
}>();

// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const tableRef = ref<InstanceType<typeof MutationsTable> | null>(null);

async function fetchPage(take: number, skip: number) {
  const result = await props.getMutations(take, skip);
  if (!result) return undefined;
  return { rows: parseFinancialMutations(result), total: result._pagination.count || 0 };
}

function refresh() {
  return tableRef.value?.refresh();
}

defineExpose({ refresh });
</script>
<style lang="scss" scoped></style>
