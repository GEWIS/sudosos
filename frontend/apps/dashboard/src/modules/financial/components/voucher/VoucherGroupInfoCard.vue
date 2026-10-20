<template>
  <CardComponent :header="t('modules.financial.vouchers.info.header')">
    <template #topAction>
      <div class="flex items-center gap-2">
        <Badge :severity="statusSeverity" :value="statusLabel" />
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
    </div>

    <VoucherGroupDialog
      v-model:visible="isEditDialogOpen"
      :voucher-group="voucherGroup"
      @saved="(updated) => emit('updated', updated)"
    />
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import type { VoucherGroupResponse } from '@gewis/sudosos-client';
import CardComponent from '@/components/CardComponent.vue';
import VoucherGroupDialog from '@/modules/financial/components/voucher/VoucherGroupDialog.vue';
import { formatDineroObject, formatDateFromString, formatPrice } from '@/utils/formatterUtils';

const { t } = useI18n();

const props = defineProps<{
  voucherGroup: VoucherGroupResponse;
}>();

const emit = defineEmits<{
  (e: 'updated', group: VoucherGroupResponse): void;
}>();

const isEditDialogOpen = ref(false);

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
