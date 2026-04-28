<template>
  <div class="flex flex-col gap-5">
    <DataTable
      class="w-full"
      data-key="id"
      filter-display="menu"
      :filters="filters"
      lazy
      :paginator="true"
      :rows="rows"
      :rows-per-page-options="[5, 10, 25, 50, 100]"
      table-style="min-width: 50rem"
      :total-records="totalRecords"
      :value="payouts"
      @page="onPage"
    >
      <Column field="id" :header="t('common.id')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ slotProps.data.id }}</span>
        </template>
      </Column>
      <Column field="createdAt" :header="t('common.date')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ formatDateFromString(slotProps.data.createdAt) }}</span>
        </template>
      </Column>
      <Column
        field="status"
        filter
        filter-match-mode="equals"
        :header="t('common.status')"
        :show-apply-button="false"
        :show-clear-button="false"
        :show-filter-match-modes="false"
      >
        <template #filter="{ filterModel }">
          <Select
            v-model="filterModel.value"
            option-label="name"
            option-value="value"
            :options="states"
            :placeholder="t('common.placeholders.selectType')"
            @change="(e) => stateFilterChange('state', e)"
          />
        </template>
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ slotProps.data.status }}</span>
        </template>
      </Column>
      <Column field="requestedBy.firstName" :header="t('modules.financial.payout.requestedBy')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ slotProps.data.requestedBy.firstName }}</span>
        </template>
      </Column>
      <Column field="approvedBy.firstName" :header="t('modules.financial.payout.approvedBy')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ slotProps.data.approvedBy ? slotProps.data.approvedBy.firstName : t('common.na') }}</span>
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
              icon="pi pi-info-circle"
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
      class="flex max-w-[40rem] w-full"
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
import { ref, type Ref } from 'vue';
import { type BasePayoutRequestResponse, PayoutRequestStatusRequestStateEnum } from '@gewis/sudosos-client';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import { type SelectChangeEvent } from 'primevue/select';
import { useI18n } from 'vue-i18n';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { formatPrice, formatDateFromString } from '@/utils/formatterUtils';
import { usePayoutStore } from '@/stores/payout.store';
import { getPayoutPdfSrc } from '@/utils/urlUtils';
import PayoutInfo from '@/modules/financial/components/payout/PayoutInfo.vue';

defineProps<{
  payouts: BasePayoutRequestResponse[];
  isLoading: boolean;
  rows: number;
  totalRecords: number;
}>();

const emit = defineEmits(['page', 'stateFilterChange']);

const { t } = useI18n();
const payoutStore = usePayoutStore();

const states: Ref<Array<{ name: string; value: string | null }>> = ref([
  { name: PayoutRequestStatusRequestStateEnum.Created, value: PayoutRequestStatusRequestStateEnum.Created },
  { name: PayoutRequestStatusRequestStateEnum.Approved, value: PayoutRequestStatusRequestStateEnum.Approved },
  { name: PayoutRequestStatusRequestStateEnum.Denied, value: PayoutRequestStatusRequestStateEnum.Denied },
  { name: PayoutRequestStatusRequestStateEnum.Cancelled, value: PayoutRequestStatusRequestStateEnum.Cancelled },
  { name: 'ALL', value: null },
]);

const filters = ref({
  status: { value: null, matchMode: 'equals' },
});

function onPage(event: DataTablePageEvent) {
  emit('page', event);
}

function stateFilterChange(key: string, e: SelectChangeEvent) {
  emit('stateFilterChange', key, e.value);
}

const showModal: Ref<boolean> = ref(false);
const dialog = ref();
const payoutId: Ref<number> = ref(0);
const downloadingPdf = ref(false);

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
</script>
