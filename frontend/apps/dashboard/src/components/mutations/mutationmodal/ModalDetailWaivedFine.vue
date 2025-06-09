<template>
  <div class="flex flex-col">
    <span>
      {{ dateString }}
    </span>
    <span>{{ t('components.mutations.modal.waivedFineDescription') }}</span>
    <br />
    <DataTable
      :pt="{
        tfoot: 'font-bold',
      }"
      :value="[
        {
          amount: waivedAmount,
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
const waivedAmount: Ref<DineroObjectResponse> = ref({ amount: 0, currency: 'EUR', precision: 2 });

const props = defineProps({
  waivedFines: {
    type: Object as () => TransferResponse,
    required: true,
  },
});

onMounted(async () => {
  console.warn(props.waivedFines);
  if (!props.waivedFines.to) {
    await router.replace('/error');
    return;
  }
  waivedAmount.value = props.waivedFines.amount;
  toFirstName.value = props.waivedFines.to.firstName;
  toLastName.value = props.waivedFines.to.lastName;
  description.value = props.waivedFines.description;
});

const dateString = computed(() => {
  return new Date(props.waivedFines.createdAt!).toLocaleString('nl-NL', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
});
</script>

<style scoped></style>
