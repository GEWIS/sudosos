<template>
  <div class="flex flex-column gap-3">
    <InputSpan
      id="name"
      :attributes="form.model.fromDate.attr.value"
      :disabled="disabled"
      :errors="form.context.errors.value.fromDate"
      :label="t('modules.seller.payouts.payout.startDate')"
      placeholder="From date"
      type="date"
      :value="form.model.fromDate.value.value"
      @update:value="updateDate('fromDate', $event)"
    />

    <InputSpan
      id="name"
      :attributes="form.model.toDate.attr.value"
      :disabled="disabled"
      :errors="form.context.errors.value.toDate"
      :label="t('modules.seller.payouts.payout.endDate')"
      placeholder="From date"
      type="date"
      :value="form.model.toDate.value.value"
      @update:value="updateDate('toDate', $event)"
    />

    <InputSpan
      id="name"
      :attributes="form.model.reference.attr.value"
      column
      :disabled="disabled"
      :errors="form.context.errors.value.reference"
      :label="t('modules.seller.payouts.payout.description')"
      placeholder="Enter payout description"
      type="textarea"
      :value="form.model.reference.value.value"
      @update:value="form.context.setFieldValue('reference', $event)"
    />
    <div>
      <span class="align-items-center flex flex-row flex-wrap gap-3 justify-content-between">
        <p class="my-0">{{ t('modules.seller.payouts.payout.amount') }}</p>
        <InputNumber
          v-if="payoutAmount"
          v-model="payoutAmount"
          currency="EUR"
          disabled
          locale="nl-NL"
          :max-fraction-digits="2"
          :min="0.0"
          :min-fraction-digits="0"
          mode="currency"
        />
        <Button
          v-else
          class="w-6"
          :disabled="!datesSelected"
          severity="info"
          type="submit"
          @click="calculatePayoutAmount"
          >{{ t('modules.seller.payouts.payout.calculateAmount') }}</Button
        >
      </span>
    </div>
    <span v-if="payoutAmount" class="align-items-center flex flex-row flex-wrap gap-3 justify-content-between">
      <p class="my-0 text-red-500">
        <i class="pi pi-exclamation-triangle red-500" /> {{ t('modules.seller.payouts.payout.check') }}
      </p>
      <Button v-if="!pdfLoading" class="w-3" type="submit" @click="getReportPdf"> {{ t('common.downloadPdf') }}</Button>
      <ProgressSpinner v-else class="h-1 w-1" />
    </span>
  </div>
</template>

<script setup lang="ts">
import InputNumber from 'primevue/inputnumber';
import { computed, type PropType, type Ref, ref, watch } from 'vue';
import type { CreateSellerPayoutRequest, UserResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import * as yup from 'yup';
import InputSpan from '@/components/InputSpan.vue';
import { createSellerPayoutObject } from '@/utils/validation-schema';
import { type Form, setSubmit, setSuccess } from '@/utils/formUtils';
import ApiService from '@/services/ApiService';
import { useSellerPayoutStore } from '@/stores/seller-payout.store';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createSellerPayoutObject>>>,
    required: true,
  },
  seller: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const payoutAmount: Ref<number | null> = ref(null);
const sellerPayoutStore = useSellerPayoutStore();

const datesSelected = computed(() => {
  return props.form.model.fromDate.value.value !== undefined && props.form.model.toDate.value.value !== undefined;
});

watch(
  () => props.form.model.fromDate.value.value,
  () => {
    payoutAmount.value = null;
  },
);
watch(
  () => props.form.model.toDate.value.value,
  () => {
    payoutAmount.value = null;
  },
);

const updateDate = (field: 'toDate' | 'fromDate', value: string) => {
  props.form.context.setFieldValue(field, value);
  payoutAmount.value = null;
};

const calculatePayoutAmount = async () => {
  if (!props.seller.id) return;
  const amount = await ApiService.user.getUsersSalesReport(
    props.seller.id,
    props.form.model.fromDate.value.value,
    props.form.model.toDate.value.value,
  );
  if (amount.data.totalInclVat.amount) {
    payoutAmount.value = amount.data.totalInclVat.amount / 100;
  }
};

const pdfLoading = ref(false);
const getReportPdf = async () => {
  pdfLoading.value = true;
  try {
    const report = await ApiService.user.getUsersSalesReportPdf(
      props.seller.id,
      props.form.model.fromDate.value.value,
      props.form.model.toDate.value.value,
      props.form.model.reference.value.value,
      'PDF',
      { responseType: 'arraybuffer' },
    );
    pdfLoading.value = false;
    // Create a Blob from the PDF buffer data
    const blob = new Blob([report.data], { type: 'application/pdf' });

    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a link element
    const link = document.createElement('a');
    link.href = url;

    // Set the file name for the download
    link.download = `${props.seller.firstName}_${props.seller.lastName}_SalesReport.pdf`;

    // Programmatically click the link to trigger the download
    link.click();

    // Clean up by revoking the object URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    pdfLoading.value = false;
  }
};

const emit = defineEmits(['update:edit']);
setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    if (!props.form.context.meta.value.dirty) {
      emit('update:edit', false);
      return;
    }
    const request: CreateSellerPayoutRequest = {
      endDate: values.toDate,
      reference: values.reference,
      requestedById: values.user.id,
      startDate: values.fromDate,
    };
    sellerPayoutStore
      .createPayout(request)
      .then(() => {
        // TODO: Refresh or update
        setSuccess(props.form, true);
      })
      .catch((err) => {
        handleError(err, toast);
        setSuccess(props.form, false);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
