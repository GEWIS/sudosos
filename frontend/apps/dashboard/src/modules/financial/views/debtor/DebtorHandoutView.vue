<template>
  <PageContainer class="max-w-[100rem]">
    <div class="flex flex-col gap-5">
      <DebtorTable v-if="handout" :handout-event="handout" />
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { FineHandoutEventResponse } from '@sudosos/sudosos-client';
import { useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import DebtorTable from '@/modules/financial/components/debtor/DebtorTable.vue';
import { useDebtorStore } from '@/stores/debtor.store';
import { handleError } from '@/utils/errorUtils';
import PageContainer from '@/layout/PageContainer.vue';

const debtorStore = useDebtorStore();
const route = useRoute();
const toast = useToast();

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
