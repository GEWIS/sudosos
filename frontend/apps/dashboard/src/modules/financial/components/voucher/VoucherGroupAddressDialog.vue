<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <Dialog
    v-model:visible="visible"
    class="w-full max-w-lg"
    :draggable="false"
    :header="t('modules.financial.vouchers.address.editTitle')"
    modal
  >
    <form class="flex flex-col gap-4 pt-2" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-1">
        <label class="font-medium" for="voucher-invoice-date">
          {{ t('modules.financial.vouchers.dialog.invoiceDate') }}
          <span class="text-red-500">{{ '*' }}</span>
        </label>
        <DatePickerString
          id="voucher-invoice-date"
          v-model="invoiceDate"
          fluid
          :invalid="submitted && !isInvoiceDateValid"
          show-icon
        />
        <small v-if="submitted && !isInvoiceDateValid" class="text-red-500">
          {{ t('modules.financial.vouchers.dialog.errors.invoiceDateRequired') }}
        </small>
        <small v-else class="text-muted-color">
          {{ t('modules.financial.vouchers.dialog.invoiceDateHelp') }}
        </small>
      </div>
      <VoucherGroupAddressFields v-model:address="address" :submitted="submitted" />

      <div class="flex justify-end gap-2 mt-4">
        <Button
          :label="t('modules.financial.vouchers.dialog.cancel')"
          outlined
          severity="secondary"
          type="button"
          @click="visible = false"
        />
        <Button :label="t('modules.financial.vouchers.dialog.save')" :loading="isSaving" type="submit" />
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import type { VoucherGroupAddressRequest, VoucherGroupResponse } from '@gewis/sudosos-client';
import DatePickerString from '@/components/DatePickerString.vue';
import VoucherGroupAddressFields from '@/modules/financial/components/voucher/VoucherGroupAddressFields.vue';
import {
  isVoucherGroupAddressComplete,
  pickVoucherGroupAddress,
  trimVoucherGroupAddress,
} from '@/modules/financial/components/voucher/voucherAddress';
import { useVoucherGroupStore } from '@/stores/voucherGroup.store';
import { handleError } from '@/utils/errorUtils';
import { formatDateFromString } from '@/utils/formatterUtils';

const { t } = useI18n();
const toast = useToast();
const voucherGroupStore = useVoucherGroupStore();

const visible = defineModel<boolean>('visible', { required: true, default: false });
const props = defineProps<{
  voucherGroup: VoucherGroupResponse;
}>();

const emit = defineEmits<{
  (e: 'saved', group: VoucherGroupResponse): void;
}>();

const address = ref<VoucherGroupAddressRequest>(pickVoucherGroupAddress(props.voucherGroup));
// YYYY-MM-DD string, like the dates in VoucherGroupDialog
const invoiceDate = ref(formatDateFromString(props.voucherGroup.invoiceDate));
const isInvoiceDateValid = computed(() => invoiceDate.value.length > 0);
const submitted = ref(false);
const isSaving = ref(false);

watch(
  () => visible.value,
  (isOpen) => {
    if (isOpen) {
      submitted.value = false;
      address.value = pickVoucherGroupAddress(props.voucherGroup);
      invoiceDate.value = formatDateFromString(props.voucherGroup.invoiceDate);
    }
  },
);

const handleSubmit = async () => {
  submitted.value = true;
  if (!isVoucherGroupAddressComplete(address.value) || !isInvoiceDateValid.value) return;

  isSaving.value = true;
  try {
    const result = await voucherGroupStore.updateVoucherGroupAddress(props.voucherGroup.id, {
      ...trimVoucherGroupAddress(address.value),
      invoiceDate: invoiceDate.value,
    });
    toast.add({
      severity: 'success',
      summary: t('modules.financial.vouchers.address.toast.success'),
      life: 3000,
    });
    visible.value = false;
    emit('saved', result);
  } catch (error) {
    handleError(error as AxiosError, toast);
  } finally {
    isSaving.value = false;
  }
};
</script>
