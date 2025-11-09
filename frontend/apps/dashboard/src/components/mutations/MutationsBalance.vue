<template>
  <DataTable
    lazy
    :paginator="paginator"
    :rows="rows"
    :rows-per-page-options="[5, 10, 25, 50, 100]"
    :total-records="totalRecords"
    :value="mutations"
    @page="onPage($event)"
  >
    <Column field="moment" :header="t('components.mutations.when')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-6" />
      </template>
      <template v-else #body="mutation">
        <span class="hidden sm:block">
          {{
            mutation.data.moment.toLocaleDateString(locale, {
              dateStyle: 'full',
            })
          }}
          <i
            v-if="mutation.data.editedAt !== undefined"
            v-tooltip="
              t('components.mutations.editedOn', {
                date: mutation.data.editedAt.toLocaleDateString(locale, {
                  dateStyle: 'short',
                }),
              })
            "
            class="pi pi-pencil ml-2"
          />
        </span>
        <span class="sm:hidden whitespace-nowrap">
          {{
            mutation.data.moment.toLocaleDateString(locale, {
              dateStyle: 'short',
            })
          }}
          <i
            v-if="mutation.data.editedAt !== undefined"
            v-tooltip="
              t('components.mutations.editedOn', {
                date: mutation.data.editedAt.toLocaleDateString(locale, {
                  dateStyle: 'short',
                }),
              })
            "
            class="pi pi-pencil ml-2"
          />
        </span>
      </template>
    </Column>

    <Column field="createdBy" :header="t(`components.mutations.${isMd ? 'createdBy' : 'By'}`)">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-6" />
      </template>
      <template v-else #body="mutation">
        {{
          mutation.data.createdBy && currentUserId !== mutation.data.createdBy?.id
            ? `${mutation.data.createdBy.firstName} ${mutation.data.createdBy.lastName}`
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

    <Column field="change" :header="t('components.mutations.amount')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="mutation">
        <!-- Deposits, Invoices, Waived fines all get green -->
        <div v-if="isIncreasingTransfer(mutation.data.type)" class="font-bold" style="color: #198754">
          {{ formatPrice((mutation.data as FinancialMutation).amount) }}
        </div>

        <!-- Fines get red -->
        <div v-else-if="isFine(mutation.data.type)" class="font-bold" style="color: #d40000">
          {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
        </div>

        <!-- Other transactions stay black -->
        <div v-else>
          {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
        </div>
      </template>
    </Column>

    <Column field="" style="width: 10%">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="mutation">
        <i class="cursor-pointer pi pi-info-circle" @click="() => openModal(mutation.data.id, mutation.data.type)" />
      </template>
    </Column>
  </DataTable>
  <ModalMutation
    v-if="openedMutationId && openedMutationType !== undefined"
    :id="openedMutationId"
    v-model:visible="isModalVisible"
    :type="openedMutationType"
  />
</template>
<script lang="ts" setup>
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { computed, onMounted, type Ref, ref } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import type { PaginatedFinancialMutationResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';
import { type FinancialMutation, FinancialMutationType, parseFinancialMutations } from '@/utils/mutationUtils';
import ModalMutation from '@/components/mutations/mutationmodal/ModalMutation.vue';
import { isIncreasingTransfer, isFine } from '@/utils/mutationUtils';
import { useSizeBreakpoints } from '@/composables/sizeBreakpoints';
import { usePrefetchMutationDetails } from '@/composables/preloadMutationDetails';

const { t, locale } = useI18n();
const userStore = useUserStore();
const { isMd } = useSizeBreakpoints();
const pl = usePrefetchMutationDetails().preload;

const props = defineProps<{
  getMutations: (take: number, skip: number) => Promise<PaginatedFinancialMutationResponse | undefined>;
  paginator?: boolean;
  rowsAmount?: number;
  preload?: boolean;
}>();

const rows: Ref<number> = ref(props.rowsAmount || 10);
const mutations = ref<FinancialMutation[]>(new Array(rows.value));
const totalRecords = ref<number>(0);
const isLoading: Ref<boolean> = ref(true);
const currentUserId = computed(() => userStore.current.user?.id);

// Expose the refresh method
async function refresh() {
  isLoading.value = true;
  const newTransactions = await props.getMutations(rows.value, 0);
  if (!newTransactions) {
    isLoading.value = false;
    return;
  }
  mutations.value = parseFinancialMutations(newTransactions);
  totalRecords.value = newTransactions._pagination.count || 0;
  isLoading.value = false;
}

onMounted(async () => {
  await refresh().then(() => {
    if (props.preload) void pl(mutations.value);
  });
});

async function onPage(event: DataTablePageEvent) {
  const newTransactions = await props.getMutations(event.rows, event.first);
  if (!newTransactions) {
    isLoading.value = true;
    return;
  }
  mutations.value = parseFinancialMutations(newTransactions);
}

const openedMutationId = ref<number>();
const openedMutationType = ref<FinancialMutationType>();
const isModalVisible = ref<boolean>(false);

function openModal(id: number, type: FinancialMutationType) {
  openedMutationId.value = id;
  openedMutationType.value = type;
  isModalVisible.value = true;
}

defineExpose({ refresh });
</script>
<style lang="scss" scoped></style>
