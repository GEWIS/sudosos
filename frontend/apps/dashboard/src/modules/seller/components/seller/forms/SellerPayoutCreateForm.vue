<template>
  <div class="flex flex-column gap-3">
    <InputSpan :label="t('modules.seller.payouts.payout.startDate')"
               :value="form.model.fromDate.value.value"
               :attributes="form.model.fromDate.attr.value"
               @update:value="updateDate('fromDate', $event)"
               :errors="form.context.errors.value.fromDate" :disabled="disabled"
               id="name" placeholder="From date" type="date"/>

    <InputSpan :label="t('modules.seller.payouts.payout.endDate')"
               :value="form.model.toDate.value.value"
               :attributes="form.model.toDate.attr.value"
               @update:value="updateDate('toDate', $event)"
               :errors="form.context.errors.value.toDate" :disabled="disabled"
               id="name" placeholder="From date" type="date"/>

    <InputSpan :label="t('modules.seller.payouts.payout.description')"
               :value="form.model.reference.value.value"
               :attributes="form.model.reference.attr.value"
               @update:value="form.context.setFieldValue('reference', $event)"
               :errors="form.context.errors.value.reference" :disabled="disabled"
               id="name" column type="textarea" placeholder="Enter payout description"/>
    <div>
                <span class="flex flex-wrap justify-content-between flex-row align-items-center gap-3">
                    <p class="my-0">{{ t('modules.seller.payouts.payout.amount') }}</p>
                        <InputNumber mode="currency" currency="EUR" locale="nl-NL"
                                     :min="0.0" v-if="payoutAmount"
                                     :min-fraction-digits="0" :max-fraction-digits="2"
                                     v-model="payoutAmount" disabled/>
                        <Button v-else type="submit" severity="info" @click="calculatePayoutAmount"
                                class="w-6" :disabled="!datesSelected">{{ t('modules.seller.payouts.payout.calculateAmount') }}</Button>
                </span>
    </div>
    <span v-if="payoutAmount" class="flex flex-wrap justify-content-between flex-row align-items-center gap-3">
          <p class="my-0 text-red-500"><i class="pi pi-exclamation-triangle red-500"/>  {{ t('modules.seller.payouts.payout.check') }}</p>
          <Button type="submit" class="w-3" @click="getReportPdf" v-if="!pdfLoading">
            {{ t('common.downloadPdf') }}</Button>
          <ProgressSpinner v-else class="w-1 h-1"/>
    </span>
  </div>
</template>

<script setup lang="ts">
import InputNumber from "primevue/inputnumber";
import InputSpan from "@/components/InputSpan.vue";
import { createSellerPayoutObject } from "@/utils/validation-schema";
import { type Form, setSubmit, setSuccess } from "@/utils/formUtils";
import { computed, type PropType, type Ref, ref, watch } from "vue";
import ApiService from "@/services/ApiService";
import type { CreateSellerPayoutRequest, UserResponse } from "@sudosos/sudosos-client";
import { useI18n } from "vue-i18n";
import { useSellerPayoutStore } from "@/stores/seller-payout.store";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import * as yup from "yup";

const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  form: {
    type:  Object as PropType<Form<yup.InferType<typeof createSellerPayoutObject>>>,
    required: true,
  },
  seller: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  }
});

const payoutAmount: Ref<number | null> = ref(null);
const sellerPayoutStore = useSellerPayoutStore();

const datesSelected = computed(() => {
  return props.form.model.fromDate.value.value !== undefined && props.form.model.toDate.value.value !== undefined;
});

watch(() => props.form.model.fromDate.value.value, () => {
  payoutAmount.value = null;
});
watch(() => props.form.model.toDate.value.value, () => {
  payoutAmount.value = null;
});

const updateDate = (field: "toDate" | "fromDate", value: string) => {
  props.form.context.setFieldValue(field, value);
  payoutAmount.value = null;
};

const calculatePayoutAmount = async () => {
  if (!props.seller.id) return;
  const amount = await ApiService.user.getUsersSalesReport(props.seller.id, props.form.model.fromDate.value.value,
      props.form.model.toDate.value.value);
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
        { responseType: 'arraybuffer' }
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
setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
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
  await sellerPayoutStore.createPayout(request).then(() => {
    // TODO: Refresh or update
    setSuccess(props.form, true);
  }).catch((err) => {
    handleError(err, toast);
    setSuccess(props.form, false);
  });
}));

</script>

<style scoped lang="scss">

</style>
