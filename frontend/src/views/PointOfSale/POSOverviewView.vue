<!--TODO: Add Localization-->

<template>
  <div class="page-container">
    <div class="page-title">{{ $t('pointOfSaleOverview.Point of sale overview') }}</div>
    <div class="content-wrapper">
      <POSOverviewTableComponent class="pos-overview-table"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import POSOverviewTableComponent from "@/components/POSOverviewTableComponent.vue";


</script>

<style scoped lang="scss">
@import "@/styles/BasePage.css";

.pos-overview-table {
  width: 80%;
}
</style>
