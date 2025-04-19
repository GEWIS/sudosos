<template>
  <div class="page-container">
    <div class="page-title">{{ t('modules.financial.write-offs.title') }}</div>
    <div class="content-wrapper flex flex-column">
      <CardComponent class="full-width mb-5" :header="t('modules.financial.write-offs.overview.header')">
        <WriteOffUserOverview />
      </CardComponent>
      <CardComponent class="full-width" :header="t('modules.financial.write-offs.table.header')">
        <WriteOffTable />
      </CardComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import WriteOffTable from '@/modules/financial/components/write-offs/WriteOffTable.vue';
import CardComponent from '@/components/CardComponent.vue';
import WriteOffUserOverview from '@/modules/financial/components/write-offs/WriteOffUserOverview.vue';

const { t } = useI18n();
</script>

<style scoped lang="scss"></style>
