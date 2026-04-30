<template>
  <EntityTable
    v-model:search="search"
    :is-loading="isLoading"
    :records="records"
    :rows="rows"
    :title="t('modules.seller.payouts.title')"
    :total-records="totalRecords"
    :use-years="false"
    @page="onPage"
    @search="searchById"
  >
    <template #columns="{ isLoading: loading }">
      <Column field="startDate" :header="t('modules.seller.payouts.payout.startDate')">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ formatDateFromString(data.startDate) }}</span>
        </template>
      </Column>

      <Column field="endDate" :header="t('modules.seller.payouts.payout.endDate')">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ formatDateFromString(data.endDate) }}</span>
        </template>
      </Column>

      <Column field="reference" :header="t('modules.seller.payouts.payout.reference')">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ data.reference }}</span>
        </template>
      </Column>

      <Column field="amount" :header="t('modules.seller.payouts.payout.amount')">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-3" />
          <span v-else>{{ formatPrice(data.amount) }}</span>
        </template>
      </Column>

      <Column :header="t('common.actions')" style="width: 10%">
        <template #body="{ data }">
          <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-3" />
          <span v-else class="items-center flex flex-row">
            <Button
              class="p-button-plain p-button-rounded p-button-text"
              icon="pi pi-info-circle"
              type="button"
              @click="() => viewPayout(data.id)"
            />
            <Button
              v-tooltip.top="t('common.verify')"
              class="p-button-plain p-button-rounded p-button-text"
              icon="pi pi-check"
              :loading="verifying"
              type="button"
              @click="verifyPayout(data)"
            />
            <Button
              v-if="!downloadingPdf"
              v-tooltip.top="t('common.downloadPdf')"
              class="p-button-plain p-button-rounded p-button-text"
              icon="pi pi-file-export"
              type="button"
              @click="() => downloadPdf(data.id)"
            />
            <Skeleton v-else class="h-2rem my-1 surface-300 w-3" />
          </span>
        </template>
      </Column>
    </template>
  </EntityTable>

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
</template>

<script setup lang="ts">
import { ref, type PropType, type Ref } from 'vue';
import { type UserResponse, type SellerPayoutResponse } from '@gewis/sudosos-client';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { formatPrice, formatDateFromString } from '@/utils/formatterUtils';
import ApiService from '@/services/ApiService';
import { getSellerPayoutPdfSrc } from '@/utils/urlUtils';
import { useSellerPayoutStore } from '@/stores/seller-payout.store';
import { handleError } from '@/utils/errorUtils';
import { useVerifyPayout } from '@/composables/verifyPayout';
import { useEntityTable } from '@/composables/useEntityTable';
import EntityTable from '@/components/EntityTable.vue';
import SellerPayoutInfo from '@/modules/seller/components/seller/SellerPayoutInfo.vue';

const { verifyPayout, verifying } = useVerifyPayout.setup();
const toast = useToast();
const { t } = useI18n();
const sellerPayoutStore = useSellerPayoutStore();

const props = defineProps({
  seller: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
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
    .getSellerPayoutReportPdf({ id })
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

async function fetchSellerPayouts({
  page,
  rows,
}: {
  year: number;
  page: number;
  rows: number;
  filters: Record<string, unknown>;
}) {
  return sellerPayoutStore.fetchPayoutsBy(props.seller.id, rows, page);
}

async function fetchSinglePayout(id: number) {
  return sellerPayoutStore.fetchPayout(id);
}

const { search, rows, isLoading, records, totalRecords, onPage, searchById } = useEntityTable<
  SellerPayoutResponse,
  Record<string, unknown>
>(fetchSellerPayouts, fetchSinglePayout, { defaultRows: 12, useYears: false });
</script>
