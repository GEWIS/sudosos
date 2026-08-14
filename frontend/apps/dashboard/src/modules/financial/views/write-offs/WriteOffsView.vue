<template>
  <PageContainer>
    <div class="flex flex-col">
      <CardComponent class="w-full mb-5" :header="t('modules.financial.write-offs.overview.header')">
        <WriteOffUserOverview />
      </CardComponent>

      <EntityTable
        v-model:search="search"
        v-model:year="year"
        :create-label="t('common.create')"
        :is-loading="isLoading"
        :records="records"
        :rows="rows"
        :title="t('modules.financial.write-offs.table.header')"
        :total-records="totalRecords"
        :years="years"
        @create="showDialog = true"
        @page="onPage"
        @search="searchById"
      >
        <template #columns="{ isLoading: loading }">
          <Column field="id" :header="t('common.id')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="w-6 my-1 h-1rem surface-300" />
              <span v-else>{{ data.id }}</span>
            </template>
          </Column>

          <Column field="date" :header="t('common.date')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="w-6 my-1 h-1rem surface-300" />
              <span v-else>{{ formatDateFromString(data.createdAt) }}</span>
            </template>
          </Column>

          <Column :header="t('common.name')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="w-6 my-1 h-1rem surface-300" />
              <span v-else>{{ data.to.firstName + ' ' + data.to.lastName }}</span>
            </template>
          </Column>

          <Column field="amount" :header="t('common.amount')">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="w-3 my-1 h-1rem surface-300" />
              <span v-else>{{ formatPrice(data.amount) }}</span>
            </template>
          </Column>

          <Column :header="t('common.actions')" style="width: 10%">
            <template #body="{ data }">
              <Skeleton v-if="loading" class="w-3 my-1 h-1rem surface-300" />
              <span v-else class="flex flex-row align-items-center">
                <Button
                  v-tooltip.top="t('common.delete')"
                  class="p-button-rounded p-button-text p-button-plain"
                  icon="pi pi-times"
                  type="button"
                  @click="showWarningModal = true"
                />
                <Button
                  v-tooltip.top="t('common.downloadPdf')"
                  class="p-button-rounded p-button-text p-button-plain"
                  :disabled="downloadingPdf"
                  icon="pi pi-file-export"
                  type="button"
                  @click="() => downloadPdf(data.id)"
                />
              </span>
            </template>
          </Column>
        </template>
      </EntityTable>

      <Dialog
        ref="warningDialog"
        v-model:visible="showWarningModal"
        class="w-auto flex"
        :draggable="false"
        :header="t('modules.financial.write-offs.delete.delete')"
        modal
        @show="addListenerOnDialogueOverlay(warningDialog)"
      >
        {{ t('modules.financial.write-offs.delete.not-possible') }}
      </Dialog>

      <FormDialog
        v-model="showDialog"
        :confirm="true"
        :form="form"
        :header="t('modules.financial.write-offs.create')"
        :is-editable="true"
      >
        <template #form="slotProps">
          <WriteOffCreateForm :form="slotProps.form" @submit:success="showDialog = false" />
        </template>
      </FormDialog>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WriteOffResponse } from '@gewis/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { useWriteOffStore } from '@/stores/writeoff.store';
import { useEntityTable } from '@/composables/useEntityTable';
import { formatDateFromString, formatPrice } from '@/utils/formatterUtils';
import { getWriteOffPdfSrc } from '@/utils/urlUtils';
import CardComponent from '@/components/CardComponent.vue';
import EntityTable from '@/components/EntityTable.vue';
import WriteOffUserOverview from '@/modules/financial/components/write-offs/WriteOffUserOverview.vue';
import PageContainer from '@/layout/PageContainer.vue';
import FormDialog from '@/components/FormDialog.vue';
import WriteOffCreateForm from '@/modules/financial/components/write-offs/forms/WriteOffCreateForm.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createWriteOffSchema } from '@/utils/validation-schema';

const { t } = useI18n();
const toast = useToast();
const writeOffStore = useWriteOffStore();

const showDialog = ref(false);
const form = schemaToForm(createWriteOffSchema);

const showWarningModal = ref(false);
const warningDialog = ref();
const downloadingPdf = ref(false);

const downloadPdf = (id: number) => {
  downloadingPdf.value = true;
  writeOffStore
    .fetchPdf(id)
    .then((url) => {
      if (url) window.location.href = getWriteOffPdfSrc(url);
    })
    .catch(() => {
      toast.add({
        severity: 'warn',
        summary: t('common.toast.info.info'),
        detail: t('modules.financial.write-offs.downloadPdf.not-possible'),
        life: 3000,
      });
    })
    .finally(() => {
      downloadingPdf.value = false;
    });
};

async function fetchWriteOffs({
  page,
  rows,
  fiscalStart,
  fiscalEnd,
}: {
  year: number;
  page: number;
  rows: number;
  filters: Record<string, unknown>;
  fiscalStart: string;
  fiscalEnd: string;
}) {
  return writeOffStore.fetchWriteOffs(rows, page, fiscalStart, fiscalEnd);
}

function fetchSingleWriteOff(id: number) {
  return writeOffStore.fetchWriteOff(id);
}

const { year, years, search, rows, isLoading, records, totalRecords, onPage, searchById } = useEntityTable<
  WriteOffResponse,
  Record<string, unknown>
>(fetchWriteOffs, fetchSingleWriteOff, {
  defaultRows: 10,
  syncQueryParams: true,
});
</script>
