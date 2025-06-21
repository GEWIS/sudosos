<template>
  <Tabs class="w-full" value="balance">
    <TabList>
      <Tab value="balance">{{ t('components.mutations.balance') }}</Tab>
      <Tab value="created">{{ t('components.mutations.created') }}</Tab>
    </TabList>
    <TabPanels>
      <TabPanel value="balance">
        <MutationsBalance :get-mutations="props.getBalanceMutations" :paginator="paginator" :simple="true" />
      </TabPanel>
      <TabPanel value="created">
        <MutationsSeller :get-mutations="props.getSellerMutations" :paginator="paginator" />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>
<script lang="ts" setup>
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
