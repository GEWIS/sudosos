<template>
  <TabView class="w-full">
    <TabPanel :header="t('components.mutations.balance')">
      <MutationsBalance :get-mutations="props.getBalanceMutations" :paginator="paginator" :simple="true" />
    </TabPanel>
    <TabPanel :header="t('components.mutations.created')">
      <MutationsSeller :get-mutations="props.getSellerMutations" :paginator="paginator" />
    </TabPanel>
  </TabView>
</template>
<script lang="ts" setup>
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import type { PaginatedBaseTransactionResponse, PaginatedFinancialMutationResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import MutationsBalance from '@/components/mutations/MutationsBalance.vue';
import MutationsSeller from '@/components/mutations/MutationsSeller.vue';

const { t } = useI18n();

const props = defineProps<{
  paginator: boolean;
  getBalanceMutations: (take: number, skip: number) => Promise<PaginatedFinancialMutationResponse | undefined>;
  getSellerMutations: (take: number, skip: number) => Promise<PaginatedBaseTransactionResponse | undefined>;
}>();
</script>
<style lang="scss" scoped></style>
