<template>
  <PageContainer class="max-w-[100rem]">
    <div class="flex flex-col gap-5">
      <CardComponent
        v-if="isAllowed('update', ['all'], 'Fine', ['any'])"
        class="w-full"
        :header="t('modules.financial.debtor.fineRound.title')"
      >
        <div class="flex flex-col gap-4 items-start justify-between sm:flex-row sm:items-center">
          <p>{{ t('modules.financial.debtor.fineRound.intro') }}</p>
          <Button icon="pi pi-play" :label="t('modules.financial.debtor.fineRound.start')" @click="showRound = true" />
        </div>
      </CardComponent>
      <DebtorTable :key="refreshKey" />
      <DebtorHandouts :key="refreshKey" />
    </div>
    <FineRoundDialog v-model:visible="showRound" @completed="refreshKey++" />
  </PageContainer>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import DebtorTable from '@/modules/financial/components/debtor/DebtorTable.vue';
import DebtorHandouts from '@/modules/financial/components/debtor/DebtorHandouts.vue';
import FineRoundDialog from '@/modules/financial/components/debtor/FineRoundDialog.vue';
import CardComponent from '@/components/CardComponent.vue';
import PageContainer from '@/layout/PageContainer.vue';

const { t } = useI18n();

const showRound = ref(false);
// Remount the overview after a fine round so it reflects the new fines
const refreshKey = ref(0);
</script>

<style scoped lang="scss"></style>
