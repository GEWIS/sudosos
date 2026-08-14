<template>
  <PageContainer>
    <div class="flex flex-col gap-4">
      <CardComponent class="w-full" :header="t('modules.financial.administrative.title')">
        <template #topAction>
          <Button
            icon="pi pi-file-export"
            :label="t('modules.financial.administrative.report.button')"
            @click="showReportModal = true"
          />
        </template>
        <div class="flex flex-col gap-4">
          <AdministrativeCostsFilters :filters="filters" @clear="clearFilters" @update:filters="handleFilterChange" />
          <AdministrativeCostsTable
            :costs="costs"
            :is-loading="isLoading"
            :pagination="pagination"
            :rows="rows"
            :rows-per-page-options="rowsPerPageOptions"
            :show-selection="true"
            @bulk-delete="handleBulkDelete"
            @delete="handleDelete"
            @page="onPage"
            @view="handleView"
          />
        </div>
      </CardComponent>

      <EligibleUsersPage @costs-updated="refreshCosts" />
    </div>

    <ModalInactive
      :id="selectedCostId"
      key="inactive-modal"
      @close="handleModalClose"
      @delete="handleDeleteFromModal"
    />

    <AdministrativeCostReportModal v-model:visible="showReportModal" @close="showReportModal = false" />

    <ConfirmDialog />
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import ConfirmDialog from 'primevue/confirmdialog';
import { AxiosError } from 'axios';
import Button from 'primevue/button';
import CardComponent from '@/components/CardComponent.vue';
import PageContainer from '@/layout/PageContainer.vue';
import AdministrativeCostsTable from '@/modules/financial/components/administrative/AdministrativeCostsTable.vue';
import AdministrativeCostsFilters from '@/modules/financial/components/administrative/AdministrativeCostsFilters.vue';
import ModalInactive from '@/components/mutations/mutationmodal/ModalInactive.vue';
import EligibleUsersPage from '@/modules/financial/components/administrative/EligibleUsersPage.vue';
import AdministrativeCostReportModal from '@/modules/financial/components/administrative/AdministrativeCostReportModal.vue';
import { useAdministrativeCosts } from '@/composables/useAdministrativeCosts';
import { useAdministrativeCostsStore } from '@/stores/administrativeCosts.store';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();

const {
  costs,
  pagination,
  isLoading,
  filters,
  rows,
  rowsPerPageOptions,
  onPage,
  setFilter,
  clearFilters: clearFiltersComposable,
} = useAdministrativeCosts();

const store = useAdministrativeCostsStore();

const selectedCostId = ref<number | undefined>();
const showReportModal = ref(false);

function handleFilterChange(newFilters: { fromId?: number; inactiveAdministrativeCostId?: number }) {
  setFilter('fromId', newFilters.fromId);
  setFilter('inactiveAdministrativeCostId', newFilters.inactiveAdministrativeCostId);
}

function clearFilters() {
  clearFiltersComposable();
}

async function refreshCosts() {
  await store.fetchCosts({
    ...filters.value,
    take: rows.value,
    skip: 0,
  });
}

function handleView(id: number) {
  selectedCostId.value = id;
}

function handleModalClose() {
  selectedCostId.value = undefined;
}

function handleDeleteFromModal() {
  selectedCostId.value = undefined;
  void refreshCosts();
}

function handleDelete(id: number) {
  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.administrative.confirm.delete'),
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      void (async () => {
        try {
          await store.deleteCost(id);
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('modules.financial.administrative.deleteSuccess'),
            severity: 'success',
            life: 3000,
          });
          void refreshCosts();
        } catch (err) {
          if (err instanceof AxiosError) {
            handleError(err, toast);
          }
        }
      })();
    },
  });
}

function handleBulkDelete(ids: number[]) {
  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.administrative.confirm.bulkDelete', { count: ids.length }),
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      void (async () => {
        try {
          await Promise.all(ids.map((id) => store.deleteCost(id)));
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('modules.financial.administrative.bulkDeleteSuccess', { count: ids.length }),
            severity: 'success',
            life: 3000,
          });
          void refreshCosts();
        } catch (err) {
          if (err instanceof AxiosError) {
            handleError(err, toast);
          }
        }
      })();
    },
  });
}
</script>

<style scoped lang="scss"></style>
