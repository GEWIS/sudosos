<template>
  <div class="flex flex-col page-container-wide">
    <div class="page-title">{{ t('modules.financial.debtor.title') }}</div>
    <div class="content-wrapper flex flex-col gap-5">
      <DebtorTable />
      <DebtorHandouts />
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import DebtorTable from '@/modules/financial/components/debtor/DebtorTable.vue';
import DebtorHandouts from '@/modules/financial/components/debtor/DebtorHandouts.vue';

const { t } = useI18n();
</script>

<style scoped lang="scss"></style>
