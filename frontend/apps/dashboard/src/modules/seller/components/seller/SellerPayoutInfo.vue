<template>
  <div class="w-full">
    <div class="flex flex-col gap-2">
      <div v-if="payout" class="flex flex-col">
        <span
          ><strong>{{ `${t('modules.seller.payouts.payout.id')}:` }}</strong> {{ `SDS-SP-${payout.id}` }}</span
        >
        <span>
          <strong>{{ `${t('modules.seller.payouts.payout.dates')}:` }}</strong>
          {{ `${formatDateFromString(payout?.startDate)} ${t('common.till')} ${formatDateFromString(payout.endDate)}` }}
        </span>
        <span
          ><strong>{{ `${t('modules.seller.payouts.payout.amount')}:` }} </strong>
          <InputNumber
            v-model="payoutAmount as number"
            currency="EUR"
            :disabled="verifySuccess === null || verifySuccess"
            locale="nl-NL"
            :min="0.0"
            mode="currency"
            @update:model-value="touched = true"
          />
        </span>
        <span v-if="verifySuccess === false && verifyAmount" class="font-bold text-red-500">
          <i class="pi pi-exclamation-triangle text-red-500"></i>
          {{ `${t('modules.seller.payouts.payout.report')}: `
          }}{{ formatPrice({ amount: verifyAmount, currency: 'EUR', precision: 2 }) }}
        </span>
        <span
          ><strong>{{ `${t('modules.seller.payouts.payout.description')}: ` }}</strong> {{ payout.reference }}</span
        >
      </div>

      <div class="flex flex-row gap-2 justify-between mt-3 w-full">
        <div>
          <Button
            icon="pi pi-trash"
            :label="t('common.delete')"
            severity="danger"
            type="button"
            @click="deletePayout"
          />
        </div>
        <div class="flex flex-row gap-2 justify-end w-full">
          <ActionButton
            v-if="touched"
            :label="t('modules.seller.payouts.payout.update')"
            :result="result"
            :submitting="submitting"
            @click="updatePayoutAmount"
          />
          <Button
            v-else
            :class="verifyButtonClass"
            :icon="verifyButtonIcon"
            :label="verifyButtonLabel"
            :loading="verifying"
            :severity="verifyButtonSeverity"
            @click="verifyPayout(payout!)"
          />
          <Button
            :disabled="downloadingPdf"
            icon="pi pi-file-export"
            :label="t('common.downloadPdf')"
            severity="danger"
            type="button"
            @click="() => downloadPdf(payoutId)"
          />
          <Button icon="pi pi-times" :label="t('common.close')" severity="secondary" @click="closeModal" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, type ComputedRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import type { SellerPayoutResponse } from '@sudosos/sudosos-client';
import InputNumber from 'primevue/inputnumber';
import { useSellerPayoutStore } from '@/stores/seller-payout.store';
import { formatDateFromString, formatPrice } from '@/utils/formatterUtils';
import { useVerifyPayout } from '@/composables/verifyPayout';
import { getSellerPayoutPdfSrc } from '@/utils/urlUtils';
import { handleError } from '@/utils/errorUtils';
import ApiService from '@/services/ApiService';
import ActionButton from '@/components/ActionButton.vue';

const {
  verifyPayout,
  verifying,
  verifyButtonLabel,
  verifyButtonIcon,
  verifyButtonClass,
  verifyButtonSeverity,
  verifySuccess,
  verifyAmount,
} = useVerifyPayout.setup();
const { t } = useI18n();
const toast = useToast();
const sellerPayoutStore = useSellerPayoutStore();

const emits = defineEmits(['close', 'payout:deleted', 'payout:updated']);

const props = defineProps({
  payoutId: {
    type: Number,
    required: true,
  },
});

const payout: ComputedRef<SellerPayoutResponse | undefined> = computed(() =>
  sellerPayoutStore.getPayout(props.payoutId),
);

const payoutAmount = ref<number | null>(payout?.value?.amount?.amount ? payout.value.amount.amount / 100 : null);
const touched = ref(false);

watch(
  () => payout?.value?.amount?.amount,
  () => {
    if (payout?.value?.amount?.amount) {
      payoutAmount.value = payout.value.amount.amount / 100;
      touched.value = false;
    }
  },
);

const downloadingPdf = ref<boolean>(false);

const closeModal = () => {
  emits('close');
};

const deletePayout = async () => {
  await sellerPayoutStore
    .deletePayout(props.payoutId)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: t('common.toast.success'),
        detail: t('common.toast.success.payoutDeleted'),
        life: 3000,
      });
      emits('payout:deleted');
    })
    .catch((err) => {
      handleError(err, toast);
    });
};

const submitting = ref(false);
const result = ref<boolean | undefined>(undefined);

const updatePayoutAmount = async () => {
  if (!payoutAmount.value) return;

  submitting.value = true;
  result.value = undefined;
  await sellerPayoutStore
    .updatePayoutAmount(props.payoutId, payoutAmount.value)
    .then(() => {
      toast.add({
        severity: 'success',
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.payoutUpdated'),
        life: 3000,
      });
      result.value = true;
      emits('payout:updated');
    })
    .catch((err) => {
      result.value = false;
      handleError(err, toast);
    })
    .finally(() => {
      submitting.value = false;
    });
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
</script>

<style scoped lang="scss"></style>
