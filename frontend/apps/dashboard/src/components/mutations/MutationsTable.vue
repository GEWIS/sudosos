<template>
  <DataTable
    :data-key="dataKey"
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
            v-if="showEditedIcon && mutation.data.editedAt !== undefined"
            v-tooltip="
              t('components.mutations.editedOn', {
                date: mutation.data.editedAt.toLocaleDateString('nl-NL', {
                  dateStyle: 'short',
                }),
              })
            "
            class="pi pi-pencil ml-2"
          />
        </span>
        <span class="sm:hidden whitespace-nowrap">
          {{
            mutation.data.moment.toLocaleDateString('nl-NL', {
              dateStyle: 'short',
            })
          }}
          <i
            v-if="showEditedIcon && mutation.data.editedAt !== undefined"
            v-tooltip="
              t('components.mutations.editedOn', {
                date: mutation.data.editedAt.toLocaleDateString('nl-NL', {
                  dateStyle: 'short',
                }),
              })
            "
            class="pi pi-pencil ml-2"
          />
        </span>
      </template>
    </Column>

    <slot :is-loading="isLoading" name="columns" />

    <Column field="amount" :header="t('components.mutations.amount')">
      <template v-if="isLoading" #body>
        <Skeleton class="h-1rem my-1 surface-300 w-3" />
      </template>
      <template v-else #body="mutation">
        <!-- Deposits, Invoices, Waived fines all get green -->
        <div v-if="isIncreasingTransfer(mutation.data.type)" class="font-bold" style="color: #198754">
          {{ formatPrice((mutation.data as FinancialMutation).amount) }}
        </div>

        <!-- Fines and inactive costs get red -->
        <div
          v-else-if="
            isFine(mutation.data.type) || mutation.data.type === FinancialMutationType.INACTIVE_ADMINISTRATIVE_COST
          "
          class="font-bold"
          style="color: #d40000"
        >
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
        <i
          class="cursor-pointer pi pi-info-circle"
          @click="() => openModal(mutation.data.id, mutation.data.type, mutation.data.inactiveCostId)"
        />
      </template>
    </Column>
  </DataTable>
  <ModalMutation
    v-if="
      openedMutationId &&
      openedMutationType !== undefined &&
      openedMutationType !== FinancialMutationType.INACTIVE_ADMINISTRATIVE_COST
    "
    :id="openedMutationId"
    v-model:visible="isModalVisible"
    :type="openedMutationType"
    @deleted="refresh"
  />
  <ModalInactive
    v-if="openedInactiveCostId"
    :id="openedInactiveCostId"
    @close="handleInactiveClose"
    @delete="handleInactiveDelete"
  />
</template>
<script lang="ts" setup>
import type { DataTablePageEvent } from 'primevue/datatable';
import { onMounted, type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';
import { type FinancialMutation, FinancialMutationType, isIncreasingTransfer, isFine } from '@/utils/mutationUtils';
import ModalMutation from '@/components/mutations/mutationmodal/ModalMutation.vue';
import ModalInactive from '@/components/mutations/mutationmodal/ModalInactive.vue';
import { usePrefetchMutationDetails } from '@/composables/preloadMutationDetails';

const { t, locale } = useI18n();
const pl = usePrefetchMutationDetails().preload;

const props = defineProps<{
  /** Fetches and parses one page of rows, normalizing whatever response shape the caller's API returns. */
  fetchPage: (take: number, skip: number) => Promise<{ rows: FinancialMutation[]; total: number } | undefined>;
  paginator?: boolean;
  rowsAmount?: number;
  preload?: boolean;
  dataKey?: string;
  showEditedIcon?: boolean;
}>();

const rows: Ref<number> = ref(props.rowsAmount || 10);
const mutations = ref<FinancialMutation[]>(new Array(rows.value));
const totalRecords = ref<number>(0);
const isLoading: Ref<boolean> = ref(true);

async function refresh() {
  isLoading.value = true;
  const result = await props.fetchPage(rows.value, 0);
  if (!result) {
    isLoading.value = false;
    return;
  }
  mutations.value = result.rows;
  totalRecords.value = result.total;
  isLoading.value = false;
}

onMounted(async () => {
  await refresh();
  if (props.preload) void pl(mutations.value);
});

async function onPage(event: DataTablePageEvent) {
  const result = await props.fetchPage(event.rows, event.first);
  if (!result) return;
  mutations.value = result.rows;
}

const openedMutationId = ref<number>();
const openedMutationType = ref<FinancialMutationType>();
const openedInactiveCostId = ref<number>();
const isModalVisible = ref<boolean>(false);

function openModal(id: number, type: FinancialMutationType, inactiveCostId?: number) {
  if (type === FinancialMutationType.INACTIVE_ADMINISTRATIVE_COST) {
    if (inactiveCostId !== undefined && inactiveCostId !== null) {
      openedInactiveCostId.value = inactiveCostId;
    }
  } else {
    openedMutationId.value = id;
    openedMutationType.value = type;
    isModalVisible.value = true;
  }
}

function handleInactiveClose() {
  openedInactiveCostId.value = undefined;
}

function handleInactiveDelete() {
  openedInactiveCostId.value = undefined;
  void refresh();
}

defineExpose({ refresh });
</script>
<style lang="scss" scoped></style>
