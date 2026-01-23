<template>
  <Dialog
    ref="dialog"
    :draggable="false"
    :header="t('modules.financial.administrative.report.title')"
    modal
    :visible="visible"
    @hide="emit('close')"
    @show="addListenerOnDialogueOverlay(dialog)"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label class="font-semibold">{{ t('modules.financial.administrative.report.fromDate') }}</label>
        <DatePicker
          v-model="fromDate"
          date-format="dd-mm-yy"
          :max-date="toDate || undefined"
          :placeholder="t('common.placeholders.selectFromDate')"
        />
      </div>
      <div class="flex flex-col gap-2">
        <label class="font-semibold">{{ t('modules.financial.administrative.report.toDate') }}</label>
        <DatePicker
          v-model="toDate"
          date-format="dd-mm-yy"
          :min-date="fromDate || undefined"
          :placeholder="t('common.placeholders.selectToDate')"
        />
      </div>
    </div>
    <template #footer>
      <div class="flex flex-row gap-2 justify-end">
        <Button :label="t('common.cancel')" outlined @click="handleClose" />
        <Button
          :disabled="!canDownload || pdfLoading"
          icon="pi pi-file-export"
          :label="t('common.downloadPdf')"
          :loading="pdfLoading"
          @click="downloadReport"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import { AxiosError } from 'axios';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

interface Props {
  visible?: boolean;
}

withDefaults(defineProps<Props>(), {
  visible: false,
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  close: [];
}>();

const { t } = useI18n();
const toast = useToast();
const dialog = ref();

const fromDate = ref<Date | null>(null);
const toDate = ref<Date | null>(null);
const pdfLoading = ref(false);

const canDownload = computed(() => fromDate.value !== null && toDate.value !== null);

function handleClose() {
  fromDate.value = null;
  toDate.value = null;
  emit('update:visible', false);
  emit('close');
}

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function downloadReport() {
  if (!fromDate.value || !toDate.value) return;

  pdfLoading.value = true;
  try {
    // Format dates as YYYY-MM-DD (date only, no time)
    const fromDateStr = formatDateToYYYYMMDD(fromDate.value);
    const toDateStr = formatDateToYYYYMMDD(toDate.value);

    const report = await apiService.inactiveAdministrativeCosts.getInactiveAdministrativeCostReportPdf(
      fromDateStr,
      toDateStr,
      { responseType: 'arraybuffer' },
    );

    // Create a Blob from the PDF buffer data
    const blob = new Blob([report.data], { type: 'application/pdf' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;

    // Set the file name for the download
    link.download = `AdministrativeCostReport_${fromDateStr}_${toDateStr}.pdf`;

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up by revoking the object URL
    URL.revokeObjectURL(url);

    toast.add({
      summary: t('common.toast.success.success'),
      detail: t('modules.financial.administrative.report.downloadSuccess'),
      severity: 'success',
      life: 3000,
    });

    handleClose();
  } catch (err) {
    if (err instanceof AxiosError) {
      handleError(err, toast);
    } else {
      console.error('Error downloading PDF:', err);
      toast.add({
        summary: t('common.toast.error.error'),
        detail: t('modules.financial.administrative.report.downloadError'),
        severity: 'error',
        life: 3000,
      });
    }
  } finally {
    pdfLoading.value = false;
  }
}
</script>

<style scoped lang="scss"></style>
