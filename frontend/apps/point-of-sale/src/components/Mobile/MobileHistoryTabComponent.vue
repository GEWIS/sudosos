<template>
  <div class="flex flex-col min-h-0 h-full">
    <div class="flex items-center gap-2 mb-2">
      <h2 class="text-2xl font-bold mr-auto">{{ settings.isBorrelmode ? 'Borrel feed' : 'History' }}</h2>
      <span v-if="settings.isBorrelmode" class="live"><span class="dot" /> Live</span>
    </div>
    <p v-if="transactions.length === 0" class="py-6 text-center opacity-60">
      {{ settings.isBorrelmode ? 'No sales at this till yet' : 'No recent purchases' }}
    </p>
    <TransactionHistoryComponent
      v-else
      class="flex-1 min-h-0"
      :open-transaction-id="openTransactionId"
      :transactions="transactions"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import TransactionHistoryComponent from '@/components/Cart/TransactionHistory/TransactionHistoryComponent.vue';
import { useCartTransactions } from '@/composables/useCartTransactions';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { useSettingStore } from '@/stores/settings.store';

const settings = useSettingStore();
const { pointOfSale } = storeToRefs(usePointOfSaleStore());

// The kiosk cart's history: the buyer's own purchases on an authenticated POS,
// or the till's sales with live updates over the websocket in borrel mode.
const { transactions, openTransactionId, loadTransactions } = useCartTransactions(pointOfSale);

onMounted(() => void loadTransactions());
</script>

<style scoped lang="scss">
.live {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.6rem;
  border-radius: var(--p-button-border-radius);
  background: #dcfce7;
  color: #15803d;
  font-size: 0.875rem;
  font-weight: 600;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: var(--p-button-border-radius);
  background: #16a34a;
}

// The kiosk history rows, aligned with the phone layout: one corner radius,
// and no second heading under the tab title.
:deep(.rounded-xl) {
  border-radius: var(--p-button-border-radius);
}

:deep(h1) {
  display: none;
}
</style>
