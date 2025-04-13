<template>
  <div class="flex flex-column page-container-wide">
    <div class="page-title">{{ t('modules.financial.debtor.handoutEvents.title') }}</div>
    <div class="content-wrapper flex flex-column gap-5">
      <DebtorTable v-if="handout" :handout-event="handout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { FineHandoutEventResponse } from '@sudosos/sudosos-client';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import DebtorTable from '@/modules/financial/components/debtor/DebtorTable.vue';
import { useDebtorStore } from '@/stores/debtor.store';
import { handleError } from '@/utils/errorUtils';

const debtorStore = useDebtorStore();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const handout = ref<FineHandoutEventResponse>();

onMounted(async () => {
  const id = Number(route.params.id);
  await debtorStore
    .fetchSingleHandoutEvent(id)
    .catch((error) => {
      handleError(error, toast);
    })
    .then((res) => {
      handout.value = res as FineHandoutEventResponse;
    });
});
</script>

<style scoped lang="scss"></style>
