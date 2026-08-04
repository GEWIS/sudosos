<template>
  <MutationsTable
    ref="tableRef"
    :fetch-page="fetchPage"
    :paginator="paginator"
    :preload="preload"
    :rows-amount="rowsAmount"
    show-edited-icon
  >
    <template #columns="{ isLoading }">
      <Column field="createdBy" :header="t(`components.mutations.${isMd ? 'createdBy' : 'By'}`)">
        <template v-if="isLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-6" />
        </template>
        <template v-else #body="mutation">
          {{
            mutation.data.createdBy && currentUserId !== mutation.data.createdBy?.id
              ? isMd
                ? `${mutation.data.createdBy.firstName} ${mutation.data.createdBy.lastName}`
                : mutation.data.createdBy.firstName
              : t('components.mutations.you')
          }}
        </template>
      </Column>

      <Column class="hidden sm:block" field="mutationPOS" :header="t('components.mutations.pos')">
        <template v-if="isLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-6" />
        </template>
        <template v-else #body="mutation">
          {{ mutation.data.pos || '-' }}
        </template>
      </Column>
    </template>
  </MutationsTable>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import type { PaginatedFinancialMutationResponse } from '@gewis/sudosos-client';
import { useI18n } from 'vue-i18n';
import { parseFinancialMutations } from '@/utils/mutationUtils';
import { useSizeBreakpoints } from '@/composables/sizeBreakpoints';
import MutationsTable from '@/components/mutations/MutationsTable.vue';

const { t } = useI18n();
const userStore = useUserStore();
const { isMd } = useSizeBreakpoints();
const currentUserId = computed(() => userStore.current.user?.id);

const props = defineProps<{
  getMutations: (take: number, skip: number) => Promise<PaginatedFinancialMutationResponse | undefined>;
  paginator?: boolean;
  rowsAmount?: number;
  preload?: boolean;
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
