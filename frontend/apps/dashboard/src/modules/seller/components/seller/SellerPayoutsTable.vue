<template>
  <div class="flex flex-col gap-5">
    <DataTable
        :rows="rows"
        :value="rowValues"
        :rows-per-page-options="[12, 24, 48, 96, 120]"
        :paginator="paginator"
        lazy
        @page="onPage($event)"
        :total-records="totalRecords"
        data-key="id"
        class="w-full"
        tableStyle="min-width: 50rem"
    >
      <Column field="startDate" :header="t('modules.seller.payouts.payout.startDate')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ formatDateFromString(slotProps.data.startDate) }}</span>
        </template>
      </Column>
      <Column field="endDate" :header="t('modules.seller.payouts.payout.endDate')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ formatDateFromString(slotProps.data.endDate) }}</span>
        </template>
      </Column>
      <Column field="reference" :header="t('modules.seller.payouts.payout.reference')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ slotProps.data.reference }}</span>
        </template>
      </Column>
      <Column field="amount" :header="t('modules.seller.payouts.payout.amount')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else>{{ formatPrice(slotProps.data.amount) }}</span>
        </template>
      </Column>
      <Column :header="t('common.actions')" style="width: 10%">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else class="flex flex-row align-items-center">
            <Button
                type="button"
                icon="pi pi-eye"
                class="p-button-rounded p-button-text p-button-plain"
                @click="() => viewPayout(slotProps.data.id)"
            />
            <Button
                icon="pi pi-check"
                type="button"
                class="p-button-rounded p-button-text p-button-plain"
                v-tooltip.top="t('common.verify')"
                @click="verifyPayout(slotProps.data)"
                :loading="verifying"
            />
            <Button
                v-tooltip.top="t('common.downloadPdf')"
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
        :header="t('modules.seller.payouts.payout.details')">
      <SellerPayoutInfo :payoutId="payoutId" @close="showModal = false"/>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, type PropType, type Ref, computed } from "vue";
import { formatPrice, formatDateFromString } from "@/utils/formatterUtils";
import {
  type UserResponse
} from "@sudosos/sudosos-client";
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import Button from "primevue/button";
import ApiService from "@/services/ApiService";
import { getSellerPayoutPdfSrc } from "@/utils/urlUtils";
import SellerPayoutInfo from "@/modules/seller/components/seller/SellerPayoutInfo.vue";
import { useSellerPayoutStore } from "@/stores/seller-payout.store";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";
import { verifyPayoutMixin } from "@/mixins/verifyPayoutMixin";
import { useI18n } from "vue-i18n";

const { verifyPayout, verifying } = verifyPayoutMixin.setup();
const toast = useToast();
const { t } = useI18n();
const sellerPayoutStore = useSellerPayoutStore();

const props = defineProps({
  seller: {
    type: Object as PropType<UserResponse>,
    required: true,
  }
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

const viewPayout = async (id: number) => {
  showModal.value = true;
  payoutId.value = id;
};

const downloadPdf = async (id: number) => {
  downloadingPdf.value = true;
  await ApiService.sellerPayouts.getSellerPayoutReportPdf(id).then((res) => {
    if (res.data.pdf) window.location.href = getSellerPayoutPdfSrc(res.data.pdf);
  }).catch((err) => {
    handleError(err, toast);
  }).finally(() => {
    downloadingPdf.value = false;
  });
};

onMounted(async () => {
  await loadPayoutRequests();
});

async function loadPayoutRequests(skip = 0) {
  isLoading.value = true;
  const response = await sellerPayoutStore.fetchPayoutsBy(props.seller.id, 12, skip).catch(async (e) => {
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

<style scoped lang="scss">
</style>
