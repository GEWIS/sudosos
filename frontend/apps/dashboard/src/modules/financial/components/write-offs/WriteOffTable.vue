<template>
  <div class="flex flex-col gap-5">
    <DataTable
      class="w-full"
      data-key="id"
      lazy
      :loading="isLoading"
      :paginator="true"
      :rows="rows"
      :rows-per-page-options="rowsPerPageOptions"
      table-style="min-width: 50rem"
      :total-records="totalRecords"
      :value="writeOffs"
      @page="onPage"
    >
      <template #header>
        <div class="flex flex-row align-items-center justify-content-between">
          <IconField icon-position="left">
            <InputIcon class="pi pi-search" />
            <InputText v-model="idQuery" :placeholder="t('common.id')" @focusout="searchId" @keyup.enter="searchId" />
          </IconField>
          <Button class="ml-2" icon="pi pi-plus" :label="t('common.create')" @click="showDialog = true" />
        </div>
      </template>
      <Column field="id" :header="t('common.id')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ slotProps.data.id }}</span>
        </template>
      </Column>
      <Column field="date" :header="t('common.date')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ formatDateFromString(slotProps.data.createdAt) }}</span>
        </template>
      </Column>
      <Column :header="t('common.name')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>{{ getName(slotProps.data) }}</span>
        </template>
      </Column>
      <Column field="amount" :header="t('common.amount')">
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
              v-tooltip.top="t('common.delete')"
              class="p-button-rounded p-button-text p-button-plain"
              icon="pi pi-times"
              type="button"
              @click="showWarning"
            />
            <Button
              v-tooltip.top="t('common.downloadPdf')"
              class="p-button-rounded p-button-text p-button-plain"
              :disabled="downloadingPdf"
              icon="pi pi-file-export"
              type="button"
              @click="() => downloadPdf(slotProps.data.id)"
            />
          </span>
        </template>
      </Column>
    </DataTable>

    <Dialog
      ref="dialog"
      v-model:visible="showWarningModal"
      class="w-auto flex"
      :draggable="false"
      :header="t('modules.financial.write-offs.delete.delete')"
      modal
      @show="addListenerOnDialogueOverlay(dialog)"
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
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { WriteOffResponse } from '@sudosos/sudosos-client';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Dialog from 'primevue/dialog';
import { useI18n } from 'vue-i18n';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'primevue/usetoast';
import type { DataTablePageEvent } from 'primevue/datatable';
import FormDialog from '@/components/FormDialog.vue';
import WriteOffCreateForm from '@/modules/financial/components/write-offs/forms/WriteOffCreateForm.vue';
import { formatDateFromString, formatPrice } from '@/utils/formatterUtils';
import { schemaToForm } from '@/utils/formUtils';
import { createWriteOffSchema } from '@/utils/validation-schema';
import { getWriteOffPdfSrc } from '@/utils/urlUtils';
import { useWriteOffStore } from '@/stores/writeoff.store';

withDefaults(
  defineProps<{
    writeOffs: WriteOffResponse[];
    isLoading: boolean;
    rows: number;
    rowsPerPageOptions?: number[];
    totalRecords: number;
  }>(),
  {
    rowsPerPageOptions: () => [5, 10, 25, 50, 100, 250],
  },
);

const emit = defineEmits(['page', 'single']);

const { t } = useI18n();
const writeOffStore = useWriteOffStore();
const toast = useToast();

const showWarningModal = ref(false);
const dialog = ref();
const showWarning = () => {
  showWarningModal.value = true;
};

const showDialog = ref(false);
const form = schemaToForm(createWriteOffSchema);

const idQuery = ref('');
const downloadingPdf = ref(false);

function onPage(event: DataTablePageEvent) {
  emit('page', event);
}

function searchId() {
  emit('single', parseInt(idQuery.value));
}

const getName = (writeOff: WriteOffResponse) => {
  return writeOff.to.firstName + ' ' + writeOff.to.lastName;
};

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
</script>
