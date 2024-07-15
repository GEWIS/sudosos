<template>
        <TabView class="w-full">
            <TabPanel :header="$t('transactions.balanceMutations')">
                    <MutationsBalance
                        :paginator="paginator"
                        :getMutations="props.getBalanceMutations"
                    />
            </TabPanel>
            <TabPanel :header="$t('transactions.createdTransactions')">
                    <MutationsSeller
                        :paginator="paginator"
                        :getMutations="props.getSellerMutations"
                    />
            </TabPanel>
        </TabView>
</template>
<script lang="ts" setup>
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';

import MutationsBalance from '@/components/mutations/MutationsBalance.vue';
import MutationsSeller from '@/components/mutations/MutationsSeller.vue';
import CardComponent from "@/components/CardComponent.vue";
import type { PaginatedBaseTransactionResponse, PaginatedFinancialMutationResponse } from "@sudosos/sudosos-client";

const props = defineProps<{
    paginator: boolean,
    getBalanceMutations: (take: number, skip: number) => Promise<PaginatedFinancialMutationResponse | undefined>,
    getSellerMutations: (take: number, skip: number) => Promise<PaginatedBaseTransactionResponse | undefined>,
}>();



</script>
<style lang="scss" scoped></style>