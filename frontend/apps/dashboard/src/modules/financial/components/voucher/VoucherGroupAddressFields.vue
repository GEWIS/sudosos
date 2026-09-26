<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div v-for="field in fields" :key="field.key" class="flex flex-col gap-1" :class="{ 'md:col-span-2': field.wide }">
      <label class="font-medium" :for="`voucher-address-${field.key}`">
        {{ t(`modules.financial.forms.invoice.${field.key}`) }}
        <span v-if="REQUIRED_ADDRESS_FIELDS.includes(field.key)" class="text-red-500">{{ '*' }}</span>
      </label>
      <InputText
        :id="`voucher-address-${field.key}`"
        v-model="address[field.key]"
        :invalid="submitted && !isAddressFieldValid(address, field.key)"
        :placeholder="t(field.placeholder)"
      />
    </div>
    <small v-if="submitted && !isVoucherGroupAddressComplete(address)" class="text-red-500 md:col-span-2">
      {{ t('modules.financial.vouchers.address.required') }}
    </small>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { VoucherGroupAddressRequest } from '@gewis/sudosos-client';
import {
  isAddressFieldValid,
  isVoucherGroupAddressComplete,
  REQUIRED_ADDRESS_FIELDS,
  type VoucherGroupAddressField,
} from '@/modules/financial/components/voucher/voucherAddress';

const { t } = useI18n();

const address = defineModel<VoucherGroupAddressRequest>('address', { required: true });
defineProps<{
  submitted: boolean;
}>();

const fields: { key: VoucherGroupAddressField; placeholder: string; wide?: boolean }[] = [
  { key: 'addressee', placeholder: 'common.placeholders.addressee' },
  { key: 'attention', placeholder: 'common.placeholders.fullName' },
  { key: 'street', placeholder: 'common.placeholders.street', wide: true },
  { key: 'postalCode', placeholder: 'common.placeholders.postalCode' },
  { key: 'city', placeholder: 'common.placeholders.city' },
  { key: 'country', placeholder: 'common.placeholders.country' },
];
</script>
