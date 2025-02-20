<template>
  <div class="flex flex-col gap-5">
    <DataTable
        :rows="rows"
        :value="invoices"
        :rows-per-page-options="[5, 10, 25, 50, 100]"
        :paginator="paginator"
        lazy
        @page="onPage($event)"
        :total-records="totalRecords"
        data-key="id"
        class="w-full"
        tableStyle="min-width: 50rem"
    >
      <Column field="date" :header="t('common.date')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>
                        {{ formatDateFromString(slotProps.data.createdAt) }}
                    </span>
        </template>
      </Column>
      <Column field="currentState.state" :header="t('common.status')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>
                        {{ slotProps.data.currentState.state }}
                    </span>
        </template>
      </Column>
      <Column field="to.firstName" :header="t('common.for')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>
                        {{ slotProps.data.to.firstName }}
                    </span>
        </template>
      </Column>
      <Column field="description" :header="t('common.description')" style="max-width: 15rem">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-6 my-1 h-1rem surface-300" />
          <span v-else>
                        {{ slotProps.data.description }}
                    </span>
        </template>
      </Column>
      <Column field="transfer.amount" :header="t('common.amount')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else>
                        {{ formatPrice(slotProps.data.transfer?.amount) }}
                    </span>
        </template>
      </Column>
      <Column :header="t('common.actions')" style="width: 10%">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="w-3 my-1 h-1rem surface-300" />
          <span v-else>
                        <Button
                            type="button"
                            icon="pi pi-eye"
                            class="p-button-rounded p-button-text p-button-plain"
                            @click="() => viewInvoice(slotProps.data.id)"
                        />
                    </span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { ref, onMounted, type PropType } from "vue";
import { useInvoiceStore } from "@/stores/invoice.store";
import { formatPrice, formatDateFromString } from "@/utils/formatterUtils";
import type { InvoiceResponse } from "@sudosos/sudosos-client";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";
import router from "@/router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const invoiceStore = useInvoiceStore();
const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);

const invoices = ref<InvoiceResponse[]>([]);

const rows = ref<number>(10);
const paginator = ref<boolean>(true);

const viewInvoice = async (id: number) => {
  let route = router.resolve({ name: 'invoiceInfo', params: { id } });
  window.open(route.href, '_blank');
};

const props = defineProps({
  state: {
    type: String as PropType<InvoiceStatusResponseStateEnum>,
    required: true,
  }
});

onMounted(async () => {
  await loadInvoices();
});

async function loadInvoices(skip = 0) {
  isLoading.value = true;
  const response = await invoiceStore.fetchInvoices(rows.value, skip, props.state);
  if (response) {
    invoices.value = response.records as InvoiceResponse[];
    totalRecords.value = response._pagination.count || 0;
  }
  isLoading.value = false;
}

async function onPage(event: DataTablePageEvent) {
  await loadInvoices(event.first);
}
</script>

<style scoped lang="scss">
/* Add your custom styles here */
</style>
