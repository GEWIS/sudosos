<template>
  <CardComponent
      :header="t('modules.financial.debtor.handoutEvents.header')"
      class="w-full">
    <DataTable
        paginator
        lazy
        v-model:rows="take"
        v-model:first="skip"
        :rowsPerPageOptions="[5, 10, 25, 50, 100]"
        :total-records="debtorStore.totalFineHandoutEvents"
        @page="updateFineHandoutEvents"
        :value="debtorStore.fineHandoutEvents"
    >
      <Column field="id" id="id" :header="t('common.id')">
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-4 my-1 h-1rem surface-300"/>
        </template>
      </Column>
      <Column field="createdAt" id="date" :header="t('modules.financial.debtor.handoutEvents.handoutDate')">
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-7 my-1 h-1rem surface-300"/>
        </template>
        <template #body="slotProps" v-else>{{ formatDateTime(new Date(slotProps.data.createdAt)) }}</template>
      </Column>
      <Column
          field="referenceDate"
          id="referenceDate"
          :header="t('modules.financial.debtor.handoutEvents.referenceDate')">
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-4 my-1 h-1rem surface-300"/>
        </template>
        <template #body="slotProps" v-else>{{ formatDateTime(new Date(slotProps.data.referenceDate)) }}</template>
      </Column>
      <Column field="count" id="count" :header="t('common.users')">
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-7 my-1 h-1rem surface-300"/>
        </template>
      </Column>
      <Column id="info" :header="t('common.info')" >
        <template #body v-if="debtorStore.isFineHandoutEventsLoading">
          <Skeleton class="w-2 my-1 h-1rem surface-300"/>
        </template>
        <template #body="{ data }" v-else>
          <i
              class="pi pi-info-circle cursor-pointer"
              @click="() => navigateToHandoutEvent(data.id)"/>
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import { formatDateTime } from "@/utils/formatterUtils";
import Column from "primevue/column";
import CardComponent from "@/components/CardComponent.vue";
import Skeleton from "primevue/skeleton";
import DataTable from "primevue/datatable";
import { onMounted, ref, watch } from "vue";
import { useDebtorStore } from "@/stores/debtor.store";

const { t } = useI18n();

const debtorStore = useDebtorStore();
const router = useRouter();

const take = ref(10);
const skip = ref(0);

watch([ take, skip ], () => updateFineHandoutEvents);
const updateFineHandoutEvents = () => {
  debtorStore.fetchFineHandoutEvents(take.value, skip.value);
};

function navigateToHandoutEvent(handoutId: number) {
  router.push({ name: "debtorSingleHandout", params: { id: handoutId } });
}

onMounted(() => {
  updateFineHandoutEvents();
});
</script>


<style scoped lang="scss">

</style>