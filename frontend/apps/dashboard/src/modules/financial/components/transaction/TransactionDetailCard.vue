<template>
  <div class="flex flex-col gap-5">
    <!-- Transaction Details Card -->
    <CardComponent :header="transaction ? `Transaction #${transaction.id}` : t('modules.admin.transactions.title')">
      <div v-if="error" class="text-red-500 text-center py-8">
        {{ error }}
      </div>
      <div v-else-if="!transaction" class="text-gray-500 text-center py-8">
        {{ t('modules.admin.transactions.enterValid') }}
      </div>
      <div v-else class="flex flex-col gap-4">
        <!-- Transaction metadata -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-row gap-2">
            <span class="font-semibold">{{ t('common.id') }}:</span>
            <span>{{ transaction.id }}</span>
          </div>
          <div class="flex flex-row gap-2">
            <span class="font-semibold">{{ t('common.date') }}:</span>
            <span>
              {{
                new Date(transaction.createdAt || '').toLocaleString('nl-NL', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })
              }}
            </span>
          </div>
          <div class="flex flex-row gap-2">
            <span class="font-semibold">{{ t('common.for') }}:</span>
            <UserLink :new-tab="true" :user="transaction.from" />
          </div>
          <div
            v-if="transaction.createdBy && transaction.createdBy.id !== transaction.from.id"
            class="flex flex-row gap-2"
          >
            <span class="font-semibold">{{ t('components.mutations.putInBy.prefix') }}:</span>
            <UserLink :new-tab="true" :user="transaction.createdBy" />
          </div>
          <div class="flex flex-row gap-2">
            <span class="font-semibold">{{ t('components.mutations.pos') }}:</span>
            <span>{{ transaction.pointOfSale.name }}</span>
          </div>
        </div>

        <!-- Products table -->
        <DataTable
          :pt="{
            tfoot: 'font-bold',
          }"
          :value="products"
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
            </template>
          </Column>
          <Column
            class="p-1"
            field="totalPriceInclVat"
            :footer="formatPrice(transaction.totalPriceInclVat)"
            footer-class="font-bold"
            :header="t('common.amount')"
          >
            <template #body="product">
              {{ formatPrice(product.data.totalPriceInclVat) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </CardComponent>

    <!-- Edit Cards (only show when editable and transaction exists) -->
    <div v-if="editable && transaction" class="flex flex-col lg:flex-row gap-5 lg:items-stretch">
      <div class="flex-1">
        <TransactionEditCard :transaction-id="transaction.id" />
      </div>
      <div class="flex-1">
        <TransactionAmountsEditCard :transaction-id="transaction.id" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TransactionResponse } from '@sudosos/sudosos-client';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import TransactionEditCard from './TransactionEditCard.vue';
import TransactionAmountsEditCard from './TransactionAmountsEditCard.vue';
import CardComponent from '@/components/CardComponent.vue';
import UserLink from '@/components/UserLink.vue';
import { formatPrice } from '@/utils/formatterUtils';
import { getProductsOfTransaction } from '@/utils/transactionUtil';

const { t } = useI18n();

const props = defineProps<{
  transaction: TransactionResponse | null;
  error?: string;
  editable?: boolean;
}>();

const products = computed(() => (props.transaction ? getProductsOfTransaction(props.transaction) : []));
</script>
