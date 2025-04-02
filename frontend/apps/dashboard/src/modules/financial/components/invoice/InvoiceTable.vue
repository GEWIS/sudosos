<template>
  <div class="flex flex-col gap-5">
    <DataTable
        :rows="rows"
        :value="invoices"
        :rows-per-page-options="[5, 10, 25, 50, 100]"
        :paginator="true"
        lazy
        @page="onPage"
        :total-records="totalRecords"
        :filters="filters"
        data-key="id"
        class="w-full"
        tableStyle="min-width: 50rem"
        filterDisplay="menu"
    >
      <Column field="date" :header="t('common.date')">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed w-6 surface-300" />
            <span v-else>
              {{ formatDateFromString(slotProps.data.createdAt) }}
            </span>
          </div>
        </template>
      </Column>

      <Column
          field="currentState.state"
          :header="t('common.status')"
          filter
          filterMatchMode="equals"
          :showFilterMatchModes="false"
          :showApplyButton="false"
          :showClearButton="false"
      >
        <template #filter="{ filterModel }">
          <Dropdown
              v-model="filterModel.value"
              @change="stateFilterChange"
              :options="states"
              optionLabel="name"
              optionValue="value"
              :placeholder="t('common.placeholders.selectType')"
          />
        </template>
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed w-6 surface-300" />
            <span v-else>
              {{ slotProps.data.currentState.state }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="to.firstName" :header="t('common.for')" style="max-width: 10rem;">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed w-6 surface-300" />
            <span v-else class="truncate">
              {{ slotProps.data.to.firstName }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="description" :header="t('common.description')" style="max-width: 15rem;">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed w-6 surface-300" />
            <span v-else class="truncate">
              {{ slotProps.data.description }}
            </span>
          </div>
        </template>
      </Column>

      <Column field="transfer.amount" :header="t('common.amount')">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed w-3 surface-300" />
            <span v-else>
              {{ formatPrice(slotProps.data.transfer?.amount) }}
            </span>
          </div>
        </template>
      </Column>

      <Column :header="t('common.actions')" style="width: 10%">
        <template #body="slotProps">
          <div class="cell-content">
            <Skeleton v-if="isLoading" class="skeleton-fixed w-3 surface-300" />
            <span v-else>
              <Button
                  type="button"
                  icon="pi pi-eye"
                  class="p-button-rounded p-button-text p-button-plain"
                  @click="() => viewInvoice(slotProps.data.id)"
              />
            </span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import { useI18n } from 'vue-i18n';
import { formatPrice, formatDateFromString } from "@/utils/formatterUtils";
import router from "@/router";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";
import { type Ref, ref } from "vue";

const props = defineProps({
  invoices: {
    type: Array,
    required: true
  },
  totalRecords: {
    type: Number,
    required: true
  },
  isLoading: {
    type: Boolean,
    required: true
  },
  rows: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['page', 'stateFilterChange']);

const { t } = useI18n();

function onPage(event: any) {
  emit('page', event);
}

function stateFilterChange(e: any) {
  console.log(e);
  emit('stateFilterChange', e);
}

const states: Ref<Array<{name: string, value: string | null}>> = ref([
  { name: InvoiceStatusResponseStateEnum.Created, value: InvoiceStatusResponseStateEnum.Created },
  { name: InvoiceStatusResponseStateEnum.Sent, value: InvoiceStatusResponseStateEnum.Sent },
  { name: InvoiceStatusResponseStateEnum.Paid, value: InvoiceStatusResponseStateEnum.Paid },
  { name: InvoiceStatusResponseStateEnum.Deleted, value: InvoiceStatusResponseStateEnum.Deleted },
  { name: 'ALL', value: null }
]);

async function viewInvoice(id: number) {
  let route = router.resolve({ name: 'invoiceInfo', params: { id } });
  window.open(route.href, '_blank');
}

const filters = ref({
  'currentState.state': { value: null, matchMode: 'equals' }
});
</script>

<style scoped lang="scss">
.truncate {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-content {
  height: 2rem;
  display: flex;
  align-items: center;
  padding: 0 0.5rem;
  box-sizing: border-box;
}


.skeleton-fixed {
  height: 1rem;
  margin: 0;
  display: block;
}
</style>
