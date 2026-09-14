<template>
  <DataTable
    v-model:first="skip"
    v-model:rows="take"
    class="w-full"
    data-key="id"
    lazy
    :paginator="paginator"
    :rows-per-page-options="rowsPerPageOptions"
    :total-records="totalRecords"
    :value="records"
    @page="fetch"
  >
    <template #empty>
      <span v-if="!isLoading">{{ t('components.audit.empty') }}</span>
    </template>

    <Column field="createdAt" :header="t('common.date')">
      <template #body="{ data }">
        <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
        <span v-else>{{ formatDateTimeShort(new Date(data.createdAt)) }}</span>
      </template>
    </Column>

    <Column field="actorName" :header="t('components.audit.actor')">
      <template #body="{ data }">
        <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
        <UserLink v-else-if="data.actor" :user="data.actor" />
        <!-- The actor was removed since, so only the name we kept is left. -->
        <span v-else>{{ data.actorName }}</span>
      </template>
    </Column>

    <Column field="action" :header="t('components.audit.action')">
      <template #body="{ data }">
        <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
        <span v-else>{{ translateOr(`components.audit.actions.${data.action}`, data.action) }}</span>
      </template>
    </Column>

    <Column v-if="showEntity" field="entityId" :header="t('components.audit.object')">
      <template #body="{ data }">
        <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-3" />
        <AppLink v-else-if="auditEntityRoute(data)" :text="objectLabel(data)" :to="auditEntityRoute(data)!" />
        <span v-else>{{ objectLabel(data) }}</span>
      </template>
    </Column>

    <Column field="changes" :header="t('components.audit.changes')">
      <template #body="{ data }">
        <Skeleton v-if="isLoading" class="h-1rem my-1 surface-300 w-6" />
        <span v-else class="text-sm">{{ formatChanges(data.changes) }}</span>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AuditLogEntryResponse, DineroObjectResponse } from '@gewis/sudosos-client';
import Skeleton from 'primevue/skeleton';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import { formatDateTimeShort, formatDineroObject } from '@/utils/formatterUtils';
import { auditEntityRoute, type AuditLogFilters } from '@/utils/auditUtil';
import UserLink from '@/components/UserLink.vue';
import AppLink from '@/components/AppLink.vue';

/**
 * The recorded mutations matching the given filters, newest first.
 * @property filters - Which mutations to show. Refetches when it changes.
 * @property [rows=10] - Entries per page.
 * @property [showEntity=true] - Show which object was mutated. Turn off on a
 * panel that already sits on that object.
 * @property [rowsPerPageOptions] - Offer a page size picker.
 * @property [alwaysPaginate=false] - Keep the pager visible even when everything
 * fits on one page, so the page size stays reachable as the log grows.
 */
interface AuditLogTableProps {
  filters?: AuditLogFilters;
  rows?: number;
  showEntity?: boolean;
  rowsPerPageOptions?: number[];
  alwaysPaginate?: boolean;
}

const props = withDefaults(defineProps<AuditLogTableProps>(), {
  filters: () => ({}),
  rows: 10,
  showEntity: true,
  rowsPerPageOptions: undefined,
  alwaysPaginate: false,
});

const { t } = useI18n();
const toast = useToast();

const records = ref<AuditLogEntryResponse[]>([]);
const totalRecords = ref(0);
const isLoading = ref(true);
const take = ref(props.rows);
const skip = ref(0);

const paginator = computed(() => props.alwaysPaginate || totalRecords.value > take.value);

async function fetch() {
  isLoading.value = true;
  await apiService.auditLogs
    .getAllAuditLogEntries({ ...props.filters, take: take.value, skip: skip.value })
    .then((res) => {
      records.value = res.data.records;
      totalRecords.value = res.data._pagination?.count || 0;
    })
    .catch((error) => handleError(error, toast))
    .finally(() => {
      isLoading.value = false;
    });
}

watch(
  () => props.filters,
  () => {
    skip.value = 0;
    void fetch();
  },
  { deep: true },
);

onMounted(() => fetch());

// vue-i18n returns the key itself when there is no translation, so an action or
// object added to the back-end still reads sensibly before it is translated.
function translateOr(key: string, fallback: string): string {
  const translated = t(key);
  return translated === key ? fallback : translated;
}

function objectLabel(entry: AuditLogEntryResponse): string {
  const type = translateOr(`components.audit.entities.${entry.entityType}`, entry.entityType);
  return entry.entityId ? `${type} #${entry.entityId}` : type;
}

function isDineroObject(value: unknown): value is DineroObjectResponse {
  return typeof value === 'object' && value !== null && 'amount' in value && 'currency' in value;
}

function stringify(value: unknown): string {
  if (isDineroObject(value)) return formatDineroObject(value);
  if (Array.isArray(value)) return value.map(stringify).join(', ');
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
}

function formatChanges(changes?: Record<string, unknown>): string {
  if (!changes) return '';
  return Object.entries(changes)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([field, value]) => `${translateOr(`components.audit.fields.${field}`, field)}: ${stringify(value)}`)
    .join(', ');
}

defineExpose({ refresh: () => fetch(), isLoading });
</script>
