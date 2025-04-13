<template>
  <CardComponent class="w-full" :header="t('modules.financial.debtor.handoutEvents.header')">
    <DataTable
      v-model:first="skip"
      v-model:rows="take"
      lazy
      paginator
      :rows-per-page-options="[5, 10, 25, 50, 100]"
      :total-records="debtorStore.totalFineHandoutEvents"
      :value="debtorStore.fineHandoutEvents"
      @page="updateFineHandoutEvents"
    >
      <Column id="id" field="id" :header="t('common.id')">
        <template v-if="debtorStore.isFineHandoutEventsLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-4" />
        </template>
      </Column>
      <Column id="date" field="createdAt" :header="t('modules.financial.debtor.handoutEvents.handoutDate')">
        <template v-if="debtorStore.isFineHandoutEventsLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-7" />
        </template>
        <template v-else #body="slotProps">{{ formatDateTime(new Date(slotProps.data.createdAt)) }}</template>
      </Column>
      <Column
        id="referenceDate"
        field="referenceDate"
        :header="t('modules.financial.debtor.handoutEvents.referenceDate')"
      >
        <template v-if="debtorStore.isFineHandoutEventsLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-4" />
        </template>
        <template v-else #body="slotProps">{{ formatDateTime(new Date(slotProps.data.referenceDate)) }}</template>
      </Column>
      <Column id="count" field="count" :header="t('common.users')">
        <template v-if="debtorStore.isFineHandoutEventsLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-7" />
        </template>
      </Column>
      <Column id="info" :header="t('common.info')">
        <template v-if="debtorStore.isFineHandoutEventsLoading" #body>
          <Skeleton class="h-1rem my-1 surface-300 w-2" />
        </template>
        <template v-else #body="{ data }">
          <i class="cursor-pointer pi pi-info-circle" @click="() => navigateToHandoutEvent(data.id)" />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import DataTable from 'primevue/datatable';
import { onMounted, ref, watch } from 'vue';
import CardComponent from '@/components/CardComponent.vue';
import { formatDateTime } from '@/utils/formatterUtils';
import { useDebtorStore } from '@/stores/debtor.store';

const { t } = useI18n();

const debtorStore = useDebtorStore();
const router = useRouter();

const take = ref(10);
const skip = ref(0);

watch([take, skip], () => updateFineHandoutEvents);
const updateFineHandoutEvents = () => {
  void debtorStore.fetchFineHandoutEvents(take.value, skip.value);
};

function navigateToHandoutEvent(handoutId: number) {
  void router.push({ name: 'debtorSingleHandout', params: { id: handoutId } });
}

onMounted(() => {
  updateFineHandoutEvents();
});
</script>

<style scoped lang="scss"></style>
