<template>
  <PageContainer>
    <div class="flex flex-col">
      <EntityTable
        v-model:search="search"
        v-model:year="year"
        :create-label="t('modules.financial.payout.create')"
        :data-table-props="{ filterDisplay: 'menu', filters }"
        :is-loading="isLoading"
        :records="records"
        :rows="rows"
        :title="t('modules.financial.payout.title')"
        :total-records="totalRecords"
        :years="years"
        @create="showDialog = true"
        @page="onPage"
        @search="searchById"
      >
        <template #columns="{ isLoading: loading }">
          <Column field="id" :header="t('common.id')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-6" />
              <span v-else>{{ data.id }}</span>
            </template>
          </Column>

          <Column field="createdAt" :header="t('common.date')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-6" />
              <span v-else>{{ formatDateFromString(data.createdAt) }}</span>
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
                @change="(e) => setFilter('state', e.value)"
              />
            </template>
            <template #body="{ data }">
              <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-6" />
              <span v-else>{{ data.status }}</span>
            </template>
          </Column>

          <Column field="requestedBy.firstName" :header="t('modules.financial.payout.requestedBy')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-6" />
              <span v-else>{{ data.requestedBy.firstName }}</span>
            </template>
          </Column>

          <Column field="approvedBy.firstName" :header="t('modules.financial.payout.approvedBy')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="h-1rem my-1 surface-300 w-6" />
              <span v-else>{{ data.approvedBy ? data.approvedBy.firstName : t('common.na') }}</span>
            </template>
          </Column>

          <Column field="amount" :header="t('common.amount')">
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
                  @click="() => viewPayoutRequest(data.id)"
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
    </div>

    <Dialog
      ref="payoutDialog"
      v-model:visible="showModal"
      class="flex max-w-[40rem] w-full"
      :draggable="false"
      :header="t('modules.financial.payout.details', { payoutId })"
      modal
      @show="addListenerOnDialogueOverlay(payoutDialog)"
    >
      <PayoutInfo :payout-id="payoutId" @close="showModal = false" />
    </Dialog>

    <FormDialog v-model="showDialog" :form="form" :header="t('modules.financial.payout.create')" :is-editable="true">
      <template #form="slotProps">
        <PayoutCreateForm :form="slotProps.form" @submit:success="showDialog = false" />
      </template>
    </FormDialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { type BasePayoutRequestResponse, PayoutRequestStatusRequestStateEnum } from '@gewis/sudosos-client';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { usePayoutStore } from '@/stores/payout.store';
import { useEntityTable } from '@/composables/useEntityTable';
import { formatPrice, formatDateFromString } from '@/utils/formatterUtils';
import { getPayoutPdfSrc } from '@/utils/urlUtils';
import { schemaToForm } from '@/utils/formUtils';
import { createPayoutSchema } from '@/utils/validation-schema';
import EntityTable from '@/components/EntityTable.vue';
import FormDialog from '@/components/FormDialog.vue';
import PayoutCreateForm from '@/modules/financial/components/payout/forms/PayoutCreateForm.vue';
import PayoutInfo from '@/modules/financial/components/payout/PayoutInfo.vue';
import PageContainer from '@/layout/PageContainer.vue';

const { t } = useI18n();
const payoutStore = usePayoutStore();

const showDialog = ref(false);
const form = schemaToForm(createPayoutSchema);

const showModal = ref(false);
const payoutDialog = ref();
const payoutId = ref(0);
const downloadingPdf = ref(false);

const states = ref([
  { name: PayoutRequestStatusRequestStateEnum.Created, value: PayoutRequestStatusRequestStateEnum.Created },
  { name: PayoutRequestStatusRequestStateEnum.Approved, value: PayoutRequestStatusRequestStateEnum.Approved },
  { name: PayoutRequestStatusRequestStateEnum.Denied, value: PayoutRequestStatusRequestStateEnum.Denied },
  { name: PayoutRequestStatusRequestStateEnum.Cancelled, value: PayoutRequestStatusRequestStateEnum.Cancelled },
  { name: 'ALL', value: null },
]);

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

async function fetchPayouts({
  page,
  rows,
  filters: f,
  fiscalStart,
  fiscalEnd,
}: {
  year: number;
  page: number;
  rows: number;
  filters: { state?: PayoutRequestStatusRequestStateEnum };
  fiscalStart: string;
  fiscalEnd: string;
}) {
  return payoutStore.fetchPayouts(rows, page, {
    status: f.state,
    fromDate: fiscalStart,
    tillDate: fiscalEnd,
  });
}

async function fetchSinglePayout(id: number) {
  return payoutStore.fetchPayout(id);
}

const {
  year,
  years,
  search,
  rows,
  isLoading,
  records,
  totalRecords,
  onPage,
  setFilter,
  reload,
  searchById,
  filters: entityFilters,
} = useEntityTable<BasePayoutRequestResponse, { state?: PayoutRequestStatusRequestStateEnum }>(
  fetchPayouts,
  fetchSinglePayout,
  {
    initialFilters: { state: undefined },
    defaultRows: 10,
    syncQueryParams: {
      serializeFilters: (f) => ({ state: f.state }),
      deserializeFilters: (q) => ({
        state: typeof q.state === 'string' ? (q.state as PayoutRequestStatusRequestStateEnum) : undefined,
      }),
    },
  },
);

const filters = ref({
  status: { value: entityFilters.value.state ?? null, matchMode: 'equals' as const },
});

watch(
  () => payoutStore.getUpdatedAt,
  () => void reload(),
);

watch(
  () => entityFilters.value.state,
  (state) => {
    filters.value.status.value = state ?? null;
  },
);
</script>
