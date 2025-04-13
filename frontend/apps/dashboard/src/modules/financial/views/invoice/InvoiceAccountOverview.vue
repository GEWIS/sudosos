<template>
  <div class="full-width my-4">
    <CardComponent class="full-width" :header="t('modules.financial.invoice.account.header')">
      <template #topAction>
        <Button icon="pi pi-plus" :label="t('common.create')" @click="showDialog = true" />
      </template>
      <DataTable :loading="isLoading" :sort-field="sortField" :sort-order="sortOrder" :value="records" @sort="onSort">
        <Column field="firstName" :header="t('common.name')" :sortable="true">
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-8" />
          </template>
          <template v-else #body="{ data }">
            <UserLink new-tab :user="data" />
          </template>
        </Column>

        <Column field="amount.amount" :header="t('modules.financial.invoice.account.balance')" :sortable="true">
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-3" />
          </template>
          <template v-else #body="{ data }">
            <span class="text-right">{{ formatPrice(data.amount) }}</span>
          </template>
        </Column>

        <Column
          field="lastTransactionDate"
          :header="t('modules.financial.invoice.account.lastTransaction')"
          :sortable="true"
        >
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-3" />
          </template>
          <template v-else #body="{ data }">
            {{ formatDateFromString(data.lastTransactionDate) }}
          </template>
        </Column>
        <Column body-style="text-align: center; overflow: visible" header-style="width: 3rem; text-align: center">
          <template v-if="isLoading" #body>
            <Skeleton class="h-1rem my-1 surface-300 w-4" />
          </template>
          <template v-else #body="{ data }">
            <Button
              v-tooltip="t('modules.financial.invoice.create.create')"
              class="p-button-plain p-button-rounded p-button-text"
              icon="pi pi-file-edit"
              type="button"
              @click="handleInvoicePush(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </CardComponent>
    <FormDialog
      v-model:model-value="showDialog"
      :form="form"
      :header="t('modules.admin.forms.user.header')"
      :is-editable="false"
    >
      <template #form="slotProps">
        <UserCreateForm
          v-model:is-visible="showDialog"
          :edit="true"
          :form="slotProps.form"
          @submit:success="showDialog = false"
        />
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue';
import type { BalanceResponse } from '@sudosos/sudosos-client';
import DataTable, { type DataTableSortEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { createUserSchema } from '@/utils/validation-schema';
import CardComponent from '@/components/CardComponent.vue';
import FormDialog from '@/components/FormDialog.vue';
import UserCreateForm from '@/modules/admin/components/users/forms/UserCreateForm.vue';
import { schemaToForm } from '@/utils/formUtils';
import router from '@/router';
import { formatDateFromString, formatPrice } from '@/utils/formatterUtils';
import UserLink from '@/components/UserLink.vue';
import { useInvoiceStore } from '@/stores/invoice.store';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const invoiceStore = useInvoiceStore();

const showDialog: Ref<boolean> = ref(false);
const form = schemaToForm(createUserSchema);

const isLoading = ref(true);
const records: Ref<BalanceResponse[]> = computed(() => Object.values(invoiceStore.negativeInvoiceUsers));

onMounted(() => {
  isLoading.value = true;
  invoiceStore
    .fetchUsersIfEmpty()
    .then(() => {
      isLoading.value = false;
    })
    .catch((err) => handleError(err, useToast()));
});

function handleInvoicePush(userId: number) {
  void router.push({ name: 'invoiceCreate', query: { userId: userId } });
}

const sortField = ref<string>('lastTransactionDate');
const sortOrder = ref<number>(-1); // 1 = asc, -1 = desc

function onSort(event: DataTableSortEvent) {
  sortField.value = event.sortField as string;
  sortOrder.value = event.sortOrder || 0;
}
</script>

<style scoped></style>
