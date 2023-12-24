<template>
  <div class="page-container flex flex-column">
    <div class="page-title">{{ $t('home.Overview') }}</div>
    <div class="content-wrapper gap-5 flex md:flex-row flex-column">
      <BalanceComponent :showOption="true"/>
      <TransactionsTableComponent
          :header="$t('c_recentTransactionsTable.recent transactions')"
          :action="$t('c_recentTransactionsTable.all transactions')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import BalanceComponent from "@/components/BalanceComponent.vue";
import TransactionsTableComponent from "@/components/TransactionsTableComponent.vue";

</script>

<style scoped lang="scss">
@import "../styles/BasePage.css";
</style>
