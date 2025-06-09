<template>
  <div class="flex flex-col">
    <span>
      {{ dateString }}
    </span>
    <span>{{ t('components.mutations.modal.fineDescription') }}</span>
    <br />
    <DataTable
      :pt="{
        tfoot: 'font-bold',
      }"
      :value="[
        {
          amount: amount,
          firstName: firstName,
          lastName: lastName,
          description: description,
        },
      ]"
    >
      <Column class="p-1" field="description" :header="t('common.description')"> </Column>
      <Column class="p-1" field="totalPriceInclVat" footer-class="font-bold" :header="t('common.amount')">
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

const firstName: Ref<string> = ref('');
const lastName: Ref<string> = ref('');
const description: Ref<string> = ref('');
const amount: Ref<DineroObjectResponse> = ref({ amount: 0, currency: 'EUR', precision: 2 });

const props = defineProps({
  fine: {
    type: Object as () => TransferResponse,
    required: true,
  },
});

onMounted(async () => {
  if (!props.fine.from) {
    await router.replace('/error');
    return;
  }
  amount.value = props.fine.amount;
  firstName.value = props.fine.from.firstName;
  lastName.value = props.fine.from.lastName;
  description.value = props.fine.description;
});

const dateString = computed(() => {
  return new Date(props.fine.createdAt!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
});
</script>

<style scoped></style>
