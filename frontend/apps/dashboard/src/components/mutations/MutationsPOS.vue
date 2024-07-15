<template>
    <DataTable :rows="rows" :value="mutations" :rowsPerPageOptions="[5, 10, 25, 50, 100]" :paginator="paginator" lazy
               @page="onPage($event)" :totalRecords="totalRecords" >
        <Column field="moment" :header="$t('transactions.when')">
            <template #body v-if="isLoading">
                <Skeleton class="w-6 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                <span class="hidden sm:block">{{ mutation.data.moment.toLocaleDateString($i18n.locale, {
                    dateStyle: 'full'
                }) }}</span>
                <span class="sm:hidden">{{
                        mutation.data.moment.toLocaleDateString('nl-NL', {
                            dateStyle: 'short'
                        })
                    }}
                </span>
            </template>
        </Column>

        <Column field="createdBy" :header="$t('transactions.createdBy')">
            <template #body v-if="isLoading">
                <Skeleton class="w-6 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                {{ mutation.data.createdBy?.firstName + " " + mutation.data.createdBy?.lastName }}
            </template>
        </Column>

        <Column field="createdFor" :header="$t('transactions.createdFor')">
            <template #body v-if="isLoading">
                <Skeleton class="w-6 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                {{ mutation.data.from?.firstName + " " + mutation.data.from?.lastName}}
            </template>
        </Column>



        <Column field="change" :header="$t('transactions.amount')">
            <template #body v-if="isLoading">
                <Skeleton class="w-3 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                <!-- Deposits, Invoices, Waived fines all get green -->
                <div v-if="isIncreasingTransfer(mutation.data.type)" style="color: #198754" class="font-bold">
                    {{ formatPrice((mutation.data as FinancialMutation).amount) }}
                </div>

                <!-- Fines get green -->
                <div v-else-if="isFine(mutation.data.type)" style="color: #d40000"
                     class="font-bold">
                    {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
                </div>

                <!-- Other transactions stay black -->
                <div v-else severity="info">
                    {{ formatPrice((mutation.data as FinancialMutation).amount, true) }}
                </div>
            </template>
        </Column>

        <Column field="" style="width: 10%">
            <template #body v-if="isLoading">
                <Skeleton class="w-3 my-1 h-1rem surface-300" />
            </template>
            <template #body="mutation" v-else>
                <i class="pi pi-info-circle cursor-pointer"
                   @click="() => openModal(mutation.data.id, mutation.data.type)" />
            </template>
        </Column>
    </DataTable>
    <ModalMutation
        v-if="openedMutationId && openedMutationType"
        v-model:visible="isModalVisible"
        :id="openedMutationId"
        :type="openedMutationType"
    />
</template>
<script lang="ts" setup>
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted, type Ref, ref } from "vue";
import { formatPrice } from '@/utils/formatterUtils';
import {
    type PaginatedBaseTransactionResponse,
    type PaginatedFinancialMutationResponse
} from "@sudosos/sudosos-client";
import {
    type FinancialMutation,
    FinancialMutationType,
    parseFinancialMutations,
    getDescription,
    isIncreasingTransfer,
    isFine
} from "@/utils/mutationUtils";
import ModalMutation from "@/components/mutations/mutationmodal/ModalMutation.vue";


const props = defineProps<{
    getMutations: (take: number, skip: number) => Promise<PaginatedBaseTransactionResponse | undefined>,
    paginator?: boolean,
    rowsAmount?: number,
}>();

const mutations = ref<FinancialMutation[]>(new Array(10));
const totalRecords = ref<number>(0);
const isLoading: Ref<boolean> = ref(true);

const rows: Ref<number> = ref(props.rowsAmount || 10);
onMounted(async () => {
    const initialMutations = await props.getMutations(rows.value, 0);
    if(!initialMutations) return;
    mutations.value = parseFinancialMutations(initialMutations);
    totalRecords.value = initialMutations._pagination.count || 0;
    isLoading.value = false;
});

async function onPage(event: DataTablePageEvent) {
    const newTransactions = await props.getMutations(event.rows, event.first);
    if(!newTransactions) {
        isLoading.value = true;
        return;
    }
    mutations.value = parseFinancialMutations(newTransactions);
}

const openedMutationId = ref<number>();
const openedMutationType = ref<FinancialMutationType>();
const isModalVisible = ref<boolean>(false);

function openModal(id: number, type: FinancialMutationType) {
    openedMutationId.value = id;
    openedMutationType.value = type;
    isModalVisible.value = true;
}
</script>
<style lang="scss" scoped></style>