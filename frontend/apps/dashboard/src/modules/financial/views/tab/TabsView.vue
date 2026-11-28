<template>
  <PageContainer>
    <CardComponent class="w-full" :header="t('modules.financial.tab.overview.header')">
      <template #topAction>
        <SelectButton
          v-model="status"
          :allow-empty="false"
          option-label="label"
          option-value="value"
          :options="statusOptions"
        />
      </template>
      <DataTable
        data-key="id"
        :first="skip"
        lazy
        :loading="loading"
        paginator
        :rows="rows"
        :rows-per-page-options="[10, 25, 50]"
        :total-records="totalRecords"
        :value="records"
        @page="onPage"
      >
        <template #empty>{{ t('modules.financial.tab.overview.empty') }}</template>
        <Column field="id" :header="t('common.id')" />
        <Column :header="t('common.name')">
          <template #body="{ data }">
            <AppLink :text="data.name" :to="{ name: 'tabDetail', params: { id: data.id } }" />
          </template>
        </Column>
        <Column :header="t('modules.financial.tab.contact')">
          <template #body="{ data }">
            <div>{{ data.contactName }}</div>
            <div class="text-sm text-muted-color">{{ data.contactEmail }}</div>
          </template>
        </Column>
        <Column :header="t('common.status')">
          <template #body="{ data }">
            <Tag
              :severity="TAB_STATUS_SEVERITY[data.status as TabResponseStatusEnum]"
              :value="t(`modules.financial.tab.status.${data.status}`)"
            />
          </template>
        </Column>
        <Column :header="t('modules.financial.tab.outstanding')">
          <template #body="{ data }">{{ formatDineroObject(data.outstanding) }}</template>
        </Column>
        <Column :header="t('common.createdAt')">
          <template #body="{ data }">{{ formatDateFromString(data.createdAt) }}</template>
        </Column>
      </DataTable>
    </CardComponent>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { isAxiosError } from 'axios';
import { useToast } from 'openvue/usetoast';
import type { DataTablePageEvent } from 'openvue/datatable';
import type { GetAllTabsStatusEnum, TabResponse, TabResponseStatusEnum } from '@gewis/sudosos-client';
import PageContainer from '@/layout/PageContainer.vue';
import CardComponent from '@/components/CardComponent.vue';
import AppLink from '@/components/AppLink.vue';
import { useTabStore } from '@/stores/tab.store';
import { formatDateFromString, formatDineroObject } from '@/utils/formatterUtils';
import { TAB_STATUS_SEVERITY } from '@/modules/financial/utils/tabStatus';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const toast = useToast();
const tabStore = useTabStore();
const route = useRoute();
const router = useRouter();

/**
 * `ALL` stands for no status filter. The URL is the source of truth, so going back from a tab
 * keeps the filter and the navbar link (no query) resets it.
 */
const status = computed<GetAllTabsStatusEnum | 'ALL'>({
  get: () => (route.query.status as GetAllTabsStatusEnum | undefined) ?? 'ALL',
  // Via the router, not history.replaceState: the router rewrites the current entry with its own location on the next push.
  set: (value) => void router.replace({ query: value === 'ALL' ? {} : { status: value } }),
});
const statusOptions = computed(() => [
  { label: t('modules.financial.tab.status.ALL'), value: 'ALL' },
  ...(['OPEN', 'PAID', 'INVOICED', 'CANCELLED'] as const).map((s) => ({
    label: t(`modules.financial.tab.status.${s}`),
    value: s,
  })),
]);

const rows = ref(25);
const skip = ref(0);
const records = ref<TabResponse[]>([]);
const totalRecords = ref(0);
const loading = ref(false);

// Only the latest request may update the table, so a slow response for an old filter or page is dropped.
let latestRequest = 0;

async function load() {
  const request = ++latestRequest;
  loading.value = true;
  try {
    const res = await tabStore.fetchTabs(rows.value, skip.value, status.value === 'ALL' ? undefined : status.value);
    if (request !== latestRequest) return;
    records.value = res.records;
    totalRecords.value = res._pagination.count;
  } catch (err) {
    if (!isAxiosError(err)) throw err;
    if (request === latestRequest) handleError(err, toast);
  } finally {
    if (request === latestRequest) loading.value = false;
  }
}

function onPage(event: DataTablePageEvent) {
  rows.value = event.rows;
  skip.value = event.first;
  void load();
}

watch(status, () => {
  skip.value = 0;
  void load();
});

onMounted(load);
</script>
