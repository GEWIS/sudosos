<template>
  <div class="full-width my-4">
    <CardComponent :header="t('modules.financial.invoice.account.header')" class="full-width">
      <DataTable
          :value="records"
          :loading="isLoading"
          :sortField="sortField"
          :sortOrder="sortOrder"
          @sort="onSort"
      >
        <template #header>
          <div class="flex flex-row align-items-center justify-content-end">
            <Button :label="t('common.create')" icon="pi pi-plus" @click="showDialog = true" />
          </div>
        </template>
        <Column
            field="firstName"
            :header="t('common.name')"
            :sortable="true"
        >
          <template #body v-if="isLoading">
            <Skeleton class="w-8 my-1 h-1rem surface-300"/>
          </template>
          <template #body="{ data }" v-else>
            <UserLink :user="data" newTab />
          </template>
        </Column>

        <Column
            field="amount.amount"
            :header="t('modules.financial.invoice.account.balance')"
            :sortable="true"
        >
          <template #body v-if="isLoading">
            <Skeleton class="w-3 my-1 h-1rem surface-300"/>
          </template>
          <template #body="{ data }" v-else>
            <span class="text-right">{{ formatPrice(data.amount) }}</span>
          </template>
        </Column>

        <Column
            field="lastTransactionDate"
            :header="t('modules.financial.invoice.account.lastTransaction')"
            :sortable="true"
        >
          <template #body v-if="isLoading">
            <Skeleton class="w-3 my-1 h-1rem surface-300"/>
          </template>
          <template #body="{ data }" v-else>
            {{ formatDateFromString(data.lastTransactionDate) }}
          </template>
        </Column>
        <Column
            headerStyle="width: 3rem; text-align: center"
            bodyStyle="text-align: center; overflow: visible"
        >
          <template #body v-if="isLoading">
            <Skeleton class="w-4 my-1 h-1rem surface-300"/>
          </template>
          <template #body="{ data }" v-else>
            <Button icon="pi pi-file-edit"
                    @click="handleInvoicePush(data.id)"
                    class="p-button-rounded p-button-text p-button-plain"
                    type="button"
                    v-tooltip="t('modules.financial.invoice.create.create')"
            />
          </template>

        </Column>
      </DataTable>
    </CardComponent>
    <FormDialog :header="t('modules.admin.forms.user.header')" v-model:modelValue="showDialog"
                :form="form"  :is-editable="false">
      <template #form="slotProps">
        <UserCreateForm
            :form="slotProps.form"
            v-model:isVisible="showDialog"
            :edit="true"
            @submit:success="showDialog = false"
        />
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue";
import type { BalanceResponse } from "@sudosos/sudosos-client";
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import { createUserSchema } from "@/utils/validation-schema";
import CardComponent from '@/components/CardComponent.vue';
import Skeleton from "primevue/skeleton";
import { useI18n } from "vue-i18n";
import FormDialog from "@/components/FormDialog.vue";
import UserCreateForm from "@/modules/admin/components/users/forms/UserCreateForm.vue";
import { schemaToForm } from "@/utils/formUtils";
import router from "@/router";
import { formatDateFromString, formatPrice } from "@/utils/formatterUtils";
import UserLink from "@/components/UserLink.vue";
import { useInvoiceStore } from "@/stores/invoice.store";


const { t } = useI18n();
const invoiceStore = useInvoiceStore();

const showDialog: Ref<boolean> = ref(false);
const form = schemaToForm(createUserSchema);

const isLoading = ref(true);
const records: Ref<BalanceResponse[]> = computed(() => Object.values(invoiceStore.negativeInvoiceUsers));

onMounted(() => {
  isLoading.value = true;
  invoiceStore.fetchUsersIfEmpty().then(() => {
    isLoading.value = false;
  });
});

function handleInvoicePush(userId : number) {
  router.push({ name: 'invoiceCreate', query: { userId: userId } });
}

const sortField = ref<any>('lastTransactionDate');
const sortOrder = ref<any>(-1); // 1 = asc, -1 = desc

function onSort(event: DataTableSortEvent) {
  sortField.value = event.sortField;
  sortOrder.value = event.sortOrder;
}

</script>

<style scoped>
</style>