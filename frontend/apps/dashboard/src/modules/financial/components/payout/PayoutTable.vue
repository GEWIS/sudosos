<template>
  <div class="flex flex-col gap-5">
    <DataTable
        :rows="rows"
        :value="rowValues"
        :rows-per-page-options="[5, 10, 25, 50, 100]"
        :paginator="paginator"
        lazy
        @page="onPage($event)"
        :total-records="totalRecords"
        data-key="id"
        class="w-full"
        tableStyle="min-width: 50rem"
    >
      <Column field="date" :header="$t('payout.Date')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ formatDateFromString(slotProps.data.createdAt) }}</span>
        </template>
      </Column>
      <Column field="status" :header="$t('payout.Progress')">
        <template #body>
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ state }}</span>
        </template>
      </Column>
      <Column field="requestedBy.firstName" :header="$t('payout.Requested by')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ slotProps.data.requestedBy.firstName }}</span>
        </template>
      </Column>
      <Column field="amount" :header="$t('transactions.amount')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else>{{ formatPrice(slotProps.data.amount) }}</span>
        </template>
      </Column>
      <Column :header="$t('payout.Actions')" style="width: 10%">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else class="flex flex-row align-items-center">
            <Button
                type="button"
                icon="pi pi-eye"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => viewPayoutRequest(slotProps.data.id)"
            />
            <Button
                v-tooltip.top="$t('payout.Download PDF')"
                type="button"
                icon="pi pi-file-export"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => downloadPdf(slotProps.data.id)"
                v-if="!downloadingPdf"
            />
            <Skeleton v-else class="w-3 my-1 h-2rem surface-300" />
          </span>
        </template>
      </Column>
    </DataTable>
    <Dialog
        modal
        ref="dialog"
        @show="addListenerOnDialogueOverlay(dialog)"
        v-model:visible="showModal"
        :draggable="false"
        class="w-auto flex w-9 md:w-4"
        :header="$t('payout.Payout details')">
      <PayoutInfo :payoutId="payoutId" @close="showModal = false"/>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType, type Ref, computed, watch } from "vue";
import { formatPrice, formatDateFromString } from "@/utils/formatterUtils";
import {
  type PaginatedBasePayoutRequestResponse, PayoutRequestStatusRequestStateEnum
} from "@sudosos/sudosos-client";
import { usePayoutStore } from "@/stores/payout.store";
import { getPayoutPdfSrc } from "@/utils/urlUtils";
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import PayoutInfo from "@/modules/financial/components/payout/PayoutInfo.vue";
import Button from "primevue/button";

const props = defineProps({
  state: {
    type: String as PropType<PayoutRequestStatusRequestStateEnum>,
    required: true,
  }
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

const viewPayoutRequest = async (id: number) => {
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

watch(() => payoutStore.getUpdatedAt, () => {
  loadPayoutRequests();
});
</script>

<style scoped lang="scss">
</style>
