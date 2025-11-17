<template>
  <PageContainer>
    <div class="flex flex-col">
      <CardComponent class="w-full" :header="t('modules.financial.vat.title')">
        <VatTable />
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';
import PageContainer from '@/layout/PageContainer.vue';
import VatTable from '@/modules/financial/components/vat/VatTable.vue';

const { t } = useI18n();
</script>

<style scoped lang="scss"></style>
