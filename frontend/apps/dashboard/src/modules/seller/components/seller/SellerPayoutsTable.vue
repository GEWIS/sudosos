<template>
  <div class="flex flex-col gap-5">
    <DataTable
      class="w-full"
      data-key="id"
      lazy
      :paginator="paginator"
      :rows="rows"
      :rows-per-page-options="[12, 24, 48, 96, 120]"
      table-style="min-width: 50rem"
      :total-records="totalRecords"
      :value="rowValues"
      @page="onPage($event)"
    >
      <Column field="startDate" :header="t('modules.seller.payouts.payout.startDate')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ formatDateFromString(slotProps.data.startDate) }}</span>
        </template>
      </Column>
      <Column field="endDate" :header="t('modules.seller.payouts.payout.endDate')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ formatDateFromString(slotProps.data.endDate) }}</span>
        </template>
      </Column>
      <Column field="reference" :header="t('modules.seller.payouts.payout.reference')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ slotProps.data.reference }}</span>
        </template>
      </Column>
      <Column field="amount" :header="t('modules.seller.payouts.payout.amount')">
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
              @click="() => viewPayout(slotProps.data.id)"
            />
            <Button
              v-tooltip.top="t('common.verify')"
              class="p-button-plain p-button-rounded p-button-text"
              icon="pi pi-check"
              :loading="verifying"
              type="button"
              @click="verifyPayout(slotProps.data)"
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
      class="flex"
      :draggable="false"
      :header="t('modules.seller.payouts.payout.details')"
      modal
      @show="addListenerOnDialogueOverlay(dialog)"
    >
      <SellerPayoutInfo :payout-id="payoutId" @close="showModal = false" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType, type Ref, computed } from 'vue';
import { type UserResponse } from '@sudosos/sudosos-client';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { formatPrice, formatDateFromString } from '@/utils/formatterUtils';
import ApiService from '@/services/ApiService';
import { getSellerPayoutPdfSrc } from '@/utils/urlUtils';
import SellerPayoutInfo from '@/modules/seller/components/seller/SellerPayoutInfo.vue';
import { useSellerPayoutStore } from '@/stores/seller-payout.store';
import { handleError } from '@/utils/errorUtils';
import { verifyPayoutMixin } from '@/mixins/verifyPayoutMixin';

const { verifyPayout, verifying } = verifyPayoutMixin.setup();
const toast = useToast();
const { t } = useI18n();
const sellerPayoutStore = useSellerPayoutStore();

const props = defineProps({
  seller: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
});

const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);

const rows = ref<number>(12);
const paginator = ref<boolean>(true);

const payouts = ref();
const rowValues = computed(() => {
  if (isLoading.value) return Array(rows.value).fill(null);
  return payouts.value;
});

const showModal: Ref<boolean> = ref(false);
const dialog = ref();
const payoutId: Ref<number> = ref(0);
const downloadingPdf = ref<boolean>(false);

const viewPayout = (id: number) => {
  showModal.value = true;
  payoutId.value = id;
};

const downloadPdf = async (id: number) => {
  downloadingPdf.value = true;
  await ApiService.sellerPayouts
    .getSellerPayoutReportPdf(id)
    .then((res) => {
      if (res.data.pdf) window.location.href = getSellerPayoutPdfSrc(res.data.pdf);
    })
    .catch((err) => {
      handleError(err, toast);
    })
    .finally(() => {
      downloadingPdf.value = false;
    });
};

onMounted(async () => {
  await loadPayoutRequests();
});

async function loadPayoutRequests(skip = 0) {
  isLoading.value = true;
  const response = await sellerPayoutStore.fetchPayoutsBy(props.seller.id, 12, skip).catch((e) => {
    handleError(e, toast);
    return;
  });
  if (response) {
    payouts.value = response.records;
    totalRecords.value = response._pagination.count || 0;
  }
  isLoading.value = false;
}

async function onPage(event: DataTablePageEvent) {
  await loadPayoutRequests(event.first);
}
</script>

<style scoped lang="scss"></style>
