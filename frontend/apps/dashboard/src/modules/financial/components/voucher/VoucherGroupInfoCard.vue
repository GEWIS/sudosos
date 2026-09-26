<template>
  <CardComponent :header="t('modules.financial.vouchers.info.header')">
    <template #topAction>
      <div class="flex items-center gap-2">
        <Badge :severity="statusSeverity" :value="statusLabel" />
        <span v-tooltip.top="hasAddress ? undefined : t('modules.financial.vouchers.pdf.needsAddress')">
          <Button
            :disabled="!hasAddress"
            icon="pi pi-file-pdf"
            :label="t('modules.financial.vouchers.pdf.download')"
            :loading="isDownloadingPdf"
            outlined
            size="small"
            @click="downloadPdf"
          />
        </span>
        <Button
          v-if="canEditAddress"
          icon="pi pi-file-edit"
          :label="t('modules.financial.vouchers.address.edit')"
          outlined
          size="small"
          @click="isAddressDialogOpen = true"
        />
        <Button
          v-if="canEdit"
          icon="pi pi-pencil"
          :label="t('common.edit')"
          outlined
          size="small"
          @click="openEditDialog"
        />
      </div>
    </template>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
      <div class="flex flex-col gap-1">
        <span class="text-sm text-muted-color">{{ t('common.name') }}</span>
        <span class="text-xl font-bold">{{ voucherGroup.name }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-sm text-muted-color">{{ t('modules.financial.vouchers.info.userCount') }}</span>
        <span class="text-xl font-bold">{{ voucherGroup.amount }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-sm text-muted-color">{{ t('modules.financial.vouchers.list.cardBalance') }}</span>
        <span class="text-xl font-bold text-green-600">{{ formatDineroObject(voucherGroup.balance) }}</span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="text-sm text-muted-color">{{ t('modules.financial.vouchers.info.allocated') }}</span>
        <span class="text-xl font-bold text-green-600">{{ totalAllocated }}</span>
      </div>

      <div class="flex flex-col gap-1 sm:col-span-2">
        <span class="text-sm text-muted-color">{{ t('modules.financial.vouchers.info.validity') }}</span>
        <span class="text-base font-medium">
          {{
            `${formatDateFromString(voucherGroup.activeStartDate)} — ${formatDateFromString(voucherGroup.activeEndDate)}`
          }}
        </span>
      </div>

      <div class="flex flex-col gap-1 sm:col-span-2">
        <span class="text-sm text-muted-color">{{ t('modules.financial.vouchers.info.created') }}</span>
        <span class="text-base text-muted-color">
          {{ formatDateFromString(voucherGroup.createdAt) }}
        </span>
      </div>

      <div class="flex flex-col gap-1 sm:col-span-2">
        <span class="text-sm text-muted-color">{{ t('modules.financial.vouchers.info.invoiceDate') }}</span>
        <span class="text-base font-medium">
          {{ formatDateFromString(voucherGroup.invoiceDate) }}
        </span>
      </div>

      <div class="flex flex-col gap-1 sm:col-span-2">
        <span class="text-sm text-muted-color">{{ t('modules.financial.vouchers.address.header') }}</span>
        <address v-if="hasAddress" class="not-italic text-base font-medium">
          <div>{{ voucherGroup.addressee }}</div>
          <div v-if="voucherGroup.attention">
            {{ t('modules.financial.vouchers.address.attn', { name: voucherGroup.attention }) }}
          </div>
          <div>{{ voucherGroup.street }}</div>
          <div>{{ `${voucherGroup.postalCode} ${voucherGroup.city}` }}</div>
          <div>{{ voucherGroup.country }}</div>
        </address>
        <Message v-else severity="warn" size="small" variant="simple">
          {{ t('modules.financial.vouchers.address.missing') }}
        </Message>
      </div>
    </div>

    <VoucherGroupDialog
      v-model:visible="isEditDialogOpen"
      :voucher-group="voucherGroup"
      @saved="(updated) => emit('updated', updated)"
    />
    <VoucherGroupAddressDialog
      v-model:visible="isAddressDialogOpen"
      :voucher-group="voucherGroup"
      @saved="(updated) => emit('updated', updated)"
    />
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import type { VoucherGroupResponse } from '@gewis/sudosos-client';
import CardComponent from '@/components/CardComponent.vue';
import VoucherGroupDialog from '@/modules/financial/components/voucher/VoucherGroupDialog.vue';
import VoucherGroupAddressDialog from '@/modules/financial/components/voucher/VoucherGroupAddressDialog.vue';
import { isVoucherGroupAddressComplete } from '@/modules/financial/components/voucher/voucherAddress';
import { useVoucherGroupStore } from '@/stores/voucherGroup.store';
import { formatDineroObject, formatDateFromString, formatPrice } from '@/utils/formatterUtils';
import { handleError } from '@/utils/errorUtils';
import { getVoucherGroupPdfSrc } from '@/utils/urlUtils';

const { t } = useI18n();
const toast = useToast();
const voucherGroupStore = useVoucherGroupStore();

const props = defineProps<{
  voucherGroup: VoucherGroupResponse;
}>();

const emit = defineEmits<{
  (e: 'updated', group: VoucherGroupResponse): void;
}>();

const isEditDialogOpen = ref(false);
const isAddressDialogOpen = ref(false);
const isDownloadingPdf = ref(false);

const hasAddress = computed(() => isVoucherGroupAddressComplete(props.voucherGroup));

// Unlike the full edit, the address and invoice date can be changed at any time: they do not touch balances.
const canEditAddress = computed(() => isAllowed('update', ['all'], 'VoucherGroup', ['*']));

const downloadPdf = async () => {
  isDownloadingPdf.value = true;
  try {
    const pdf = await voucherGroupStore.fetchVoucherGroupPdf(props.voucherGroup.id);
    if (pdf) window.location.href = getVoucherGroupPdfSrc(pdf);
  } catch (error) {
    handleError(error as AxiosError, toast);
  } finally {
    isDownloadingPdf.value = false;
  }
};

const canEdit = computed(() => {
  if (!isAllowed('update', ['all'], 'VoucherGroup', ['*'])) return false;
  if (!props.voucherGroup.activeStartDate) return false;
  return new Date(props.voucherGroup.activeStartDate) > new Date();
});

const openEditDialog = () => {
  isEditDialogOpen.value = true;
};

const status = computed((): 'upcoming' | 'active' | 'expired' => {
  const now = new Date();
  const start = props.voucherGroup.activeStartDate ? new Date(props.voucherGroup.activeStartDate) : new Date(0);
  const end = new Date(props.voucherGroup.activeEndDate);

  if (now < start) return 'upcoming';
  if (now > end) return 'expired';
  return 'active';
});

const statusSeverity = computed((): 'info' | 'success' | 'secondary' => {
  if (status.value === 'active') return 'success';
  if (status.value === 'upcoming') return 'info';
  return 'secondary';
});

const statusLabel = computed(() => t(`modules.financial.vouchers.status.${status.value}`));

const totalAllocated = computed(() => {
  const totalCents = (props.voucherGroup.balance?.amount || 0) * (props.voucherGroup.amount || 0);
  return formatPrice({
    amount: totalCents,
    currency: props.voucherGroup.balance?.currency || 'EUR',
    precision: props.voucherGroup.balance?.precision ?? 2,
  });
});
</script>
