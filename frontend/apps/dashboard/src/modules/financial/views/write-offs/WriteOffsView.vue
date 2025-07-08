<template>
  <PageContainer>
    <div class="flex flex-col">
      <CardComponent class="w-full mb-5" :header="t('modules.financial.write-offs.overview.header')">
        <WriteOffUserOverview />
      </CardComponent>
      <CardComponent class="w-full" :header="t('modules.financial.write-offs.table.header')">
        <WriteOffTableYear />
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';
import WriteOffUserOverview from '@/modules/financial/components/write-offs/WriteOffUserOverview.vue';
import PageContainer from '@/layout/PageContainer.vue';
import WriteOffTableYear from '@/modules/financial/components/write-offs/WriteOffTableYear.vue';

const { t } = useI18n();
</script>

<style scoped lang="scss"></style>
