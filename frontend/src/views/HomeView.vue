<template>
  <div class="page-container">
    <div class="page-title">{{ $t('home.Overview') }}</div>
    <div class="content-wrapper">
      <BalanceComponent class="balance-component" :showOption="true" />
      <TransactionsTableComponent
        class="transactions-table"
        :header="$t('c_recentTransactionsTable.recent transactions')"
        :action="$t('c_recentTransactionsTable.all transactions')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BalanceComponent from '@/components/BalanceComponent.vue';
import TransactionsTableComponent from '@/components/TransactionsTableComponent.vue';
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';

const route = useRoute();
const toast = useToast();
onMounted(() => {
  if (route.redirectedFrom && route.redirectedFrom.query.redirect_status === 'failed') {
    toast.add({ summary: 'ERROR', detail: 'Payment failed', severity: "error", life: 3000, });
  }
});
</script>

<style scoped lang="scss">
@import '../styles/BasePage.css';

.balance-component {
  margin-right: 15px;
}

.transactions-table {
  margin-left: 15px;
}
</style>
