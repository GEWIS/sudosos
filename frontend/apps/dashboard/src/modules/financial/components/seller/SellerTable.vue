<template>
  <CardComponent class="w-full" :header="t('modules.financial.seller.title')">
    <DataTable
      data-key="id"
      lazy
      :loading="isLoading"
      :paginator="true"
      :rows="rows"
      :rows-per-page-options="[5, 10, 25, 50, 100]"
      table-style="min-width: 50rem"
      :total-records="totalRecords"
      :value="rowValues"
      @page="onPage"
    >
      <Column field="id" :header="t('common.id')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <span v-else>{{ slotProps.data.id }}</span>
        </template>
      </Column>
      <Column field="name" :header="t('common.name')">
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
          <UserLink v-else new-tab :user="slotProps.data.user" />
        </template>
      </Column>
      <Column field="active" :show-filter-match-modes="false">
        <template #header>
          <div class="items-center flex flex-row gap-2">
            {{ t('common.active') }}
            <Checkbox v-model="showAllActiveSellers" v-tooltip="tooltipText" binary />
          </div>
        </template>
        <template #body="slotProps">
          <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-2" />
          <span v-else>{{ slotProps.data.user.active ? t('common.active') : t('common.inactive') }}</span>
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { UserResponse } from '@sudosos/sudosos-client';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Checkbox from 'primevue/checkbox';
import Skeleton from 'primevue/skeleton';
import CardComponent from '@/components/CardComponent.vue';
import UserLink from '@/components/UserLink.vue';
import apiService from '@/services/ApiService';
import { debounce } from '@/utils/debounceUtil';
import { USER_TYPES } from '@/utils/validation-schema';

const { t } = useI18n();

const totalRecords = ref<number>(0);
const isLoading = ref<boolean>(true);
const rows = ref<number>(10);
const skip = ref<number>(0);
const sellers = ref<UserResponse[]>([]);
const showAllActiveSellers = ref<boolean>(false);

const tooltipText = computed(() => {
  return showAllActiveSellers.value
    ? t('modules.financial.seller.showAllTooltip')
    : t('modules.financial.seller.showActiveOnlyTooltip');
});

const rowValues = computed(() => {
  if (isLoading.value) return Array(rows.value).fill(null);
  return sellers.value.map((seller) => ({
    id: seller.id,
    user: seller,
  }));
});

async function loadSellers(): Promise<void> {
  isLoading.value = true;
  try {
    const response = await apiService.user.getAllUsers(
      rows.value,
      skip.value,
      '',
      showAllActiveSellers.value ? undefined : true,
      undefined,
      undefined,
      USER_TYPES.ORGAN,
    );
    if (response.data) {
      sellers.value = response.data.records;
      totalRecords.value = response.data._pagination.count || 0;
    }
  } finally {
    isLoading.value = false;
  }
}

const delayedLoadSellers = debounce(loadSellers, 250);

function onPage(event: DataTablePageEvent) {
  rows.value = event.rows;
  skip.value = event.first;
  delayedLoadSellers();
}

watch(showAllActiveSellers, () => {
  skip.value = 0;
  delayedLoadSellers();
});

onMounted(() => {
  void loadSellers();
});
</script>

<style scoped lang="scss"></style>
