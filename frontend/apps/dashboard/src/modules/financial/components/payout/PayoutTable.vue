<template>
  <div class="flex flex-col gap-5">
    <DataTable
      class="w-full"
      data-key="id"
      lazy
      :paginator="paginator"
      :rows="rows"
      :rows-per-page-options="[5, 10, 25, 50, 100]"
      table-style="min-width: 50rem"
      :total-records="totalRecords"
      :value="rowValues"
      @page="onPage($event)"
    >
      <Column field="date" :header="t('common.date')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ formatDateFromString(slotProps.data.createdAt) }}</span>
        </template>
      </Column>
      <Column field="status" :header="t('common.status')">
        <template #body>
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ state }}</span>
        </template>
      </Column>
      <Column field="requestedBy.firstName" :header="t('modules.financial.payout.requestedBy')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ slotProps.data.requestedBy.firstName }}</span>
        </template>
      </Column>
      <Column field="amount" :header="t('common.amount')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-3" />
          <span v-else>{{ formatPrice(slotProps.data.amount) }}</span>
        </template>
      </Column>
      <Column :header="t('common.actions')" style="width: 10%">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-3" />
          <span v-else class="items-center flex flex-row">
            <Button
              class="p-button-plain p-button-rounded p-button-text"
              icon="pi pi-eye"
              type="button"
              @click="() => viewPayoutRequest(slotProps.data.id)"
            />
            <Button
              v-if="!downloadingPdf"
              v-tooltip.top="t('common.downloadPdf')"
              class="p-button-plain p-button-rounded p-button-text"
              icon="pi pi-file-export"
              type="button"
              @click="() => downloadPdf(slotProps.data.id)"
            />
            <Skeleton v-else class="h-2rem my-1 surface-300 w-3" />
          </span>
        </template>
      </Column>
    </DataTable>
    <Dialog
      ref="dialog"
      v-model:visible="showModal"
      class="flex w-1/3"
      :draggable="false"
      :header="t('modules.financial.payout.details', { payoutId })"
      modal
      @show="addListenerOnDialogueOverlay(dialog)"
    >
      <PayoutInfo :payout-id="payoutId" @close="showModal = false" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType, type Ref, computed, watch } from 'vue';
import { type PaginatedBasePayoutRequestResponse, PayoutRequestStatusRequestStateEnum } from '@sudosos/sudosos-client';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { formatPrice, formatDateFromString } from '@/utils/formatterUtils';
import { usePayoutStore } from '@/stores/payout.store';
import { getPayoutPdfSrc } from '@/utils/urlUtils';
import PayoutInfo from '@/modules/financial/components/payout/PayoutInfo.vue';

const { t } = useI18n();

const props = defineProps({
  state: {
    type: String as PropType<PayoutRequestStatusRequestStateEnum>,
    required: true,
  },
});

const payoutStore = usePayoutStore();
const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);

const rows = ref<number>(5);
const paginator = ref<boolean>(true);

const payoutRequests = ref();
const rowValues = computed(() => {
  if (isLoading.value) return Array(rows.value).fill(null);
  return payoutRequests.value;
});

const showModal: Ref<boolean> = ref(false);
const dialog = ref();
const payoutId: Ref<number> = ref(0);
const downloadingPdf = ref<boolean>(false);

const viewPayoutRequest = (id: number) => {
  showModal.value = true;
  payoutId.value = id;
};

const downloadPdf = async (id: number) => {
  downloadingPdf.value = true;
  const result = await payoutStore.fetchPdf(id);
  window.location.href = getPayoutPdfSrc(result);
  downloadingPdf.value = false;
};

onMounted(async () => {
  await loadPayoutRequests();
});

async function loadPayoutRequests(skip = 0) {
  isLoading.value = true;
  const response: PaginatedBasePayoutRequestResponse = await payoutStore.fetchPayouts(rows.value, skip, props.state);
  if (response) {
    payoutRequests.value = response.records;
    totalRecords.value = response._pagination.count || 0;
  }
  isLoading.value = false;
}

async function onPage(event: DataTablePageEvent) {
  await loadPayoutRequests(event.first);
}

watch(
  () => payoutStore.getUpdatedAt,
  () => {
    void loadPayoutRequests();
  },
);
</script>

<style scoped lang="scss"></style>
