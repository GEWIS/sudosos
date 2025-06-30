<template>
  <div class="flex flex-col">
    <span>
      {{
        new Date(transactionInfo.createdAt!!).toLocaleString('nl-NL', {
          dateStyle: 'short',
          timeStyle: 'short',
        })
      }}
    </span>
    <span>
      <UserLink :new-tab="true" :user="transactionInfo.from" />
      {{
        t('components.mutations.otherBoughtAt.suffix', {
          pos: transactionInfo.pointOfSale.name,
        })
      }}
    </span>
    <span v-if="transactionInfo.createdBy && transactionInfo.createdBy.id != transactionInfo.from.id">
      {{ t('components.mutations.putInBy.prefix') }}
      <UserLink :new-tab="true" :user="transactionInfo.createdBy" />
    </span>

    <br />
    <DataTable
      :pt="{
        tfoot: 'font-bold',
      }"
      :value="productsInfo"
    >
      <Column class="p-1" field="amount" header="#"></Column>
      <Column class="p-1" field="product.name" :header="t('common.title')"></Column>
      <Column
        class="p-1"
        field="product.priceInclVat"
        :footer="t('common.total')"
        footer-class="font-bold"
        :header="t('common.price')"
      >
        <template #body="product">
          {{ formatPrice(product.data.product.priceInclVat) }}
        </template></Column
      >
      <Column
        class="p-1"
        field="totalPriceInclVat"
        :footer="formatPrice(transactionInfo.totalPriceInclVat)"
        footer-class="font-bold"
        :header="t('common.amount')"
      >
        <template #body="product">
          {{ formatPrice(product.data.totalPriceInclVat) }}
        </template>
      </Column>
    </DataTable>

    <a class="cursor-pointer text-right underline" @click="sendEmail(transactionInfo, productsInfo)">
      {{ t('components.mutations.notYou') }}
    </a>
  </div>
</template>
<script setup lang="ts">
import type { SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';
import type { TransactionResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { sendEmail } from '@/utils/mailUtil';
import { formatPrice } from '@/utils/formatterUtils';
import UserLink from '@/components/UserLink.vue';

const { t } = useI18n();

defineProps({
  transactionInfo: {
    type: Object as () => TransactionResponse,
    required: true,
  },
  productsInfo: {
    type: Object as () => Array<SubTransactionRowResponse>,
    required: true,
  },
});
</script>
