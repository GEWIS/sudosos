<template>
  <div class="flex flex-column">
    <span>
      {{ dateString }}
    </span>
    <span>{{ t('components.mutations.modal.payoutRequestDescription') }}</span>
    <br />
    <DataTable
      :pt="{
        tfoot: 'font-bold',
      }"
      :value="[
        {
          amount: payoutAmount,
          firstName: toFirstName,
          lastName: toLastName,
          description: description,
        },
      ]"
    >
      <Column class="p-1" field="description" :header="t('common.description')"> </Column>
      <Column class="p-1" field="waivedAmount" footer-class="font-bold" :header="t('common.amount')">
        <template #body="product">
          {{ formatPrice(product.data.amount) }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { onMounted, type Ref, ref, computed } from 'vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import type { DineroObjectResponse, TransferResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import { formatPrice } from '@/utils/formatterUtils';

const { t } = useI18n();

const toFirstName: Ref<string> = ref('');
const toLastName: Ref<string> = ref('');
const description: Ref<string> = ref('');
const payoutAmount: Ref<DineroObjectResponse> = ref({ amount: 0, currency: 'EUR', precision: 2 });

const props = defineProps({
  payoutRequest: {
    type: Object as () => TransferResponse,
    required: true,
  },
});

onMounted(async () => {
  if (!props.payoutRequest.from) {
    await router.replace('/error');
    return;
  }
  payoutAmount.value = props.payoutRequest.amount;
  toFirstName.value = props.payoutRequest.from.firstName;
  toLastName.value = props.payoutRequest.from.lastName;
  description.value = props.payoutRequest.description;
});

const dateString = computed(() => {
  return new Date(props.payoutRequest.createdAt!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
});
</script>

<style scoped></style>
