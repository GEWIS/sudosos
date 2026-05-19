<template>
  <PageContainer>
    <div class="flex flex-col gap-6">
      <CardComponent :header="t('modules.admin.tasks.title')">
        <div class="flex flex-wrap items-end gap-4">
          <div
            v-for="metric in metrics"
            :key="metric.key"
            class="flex flex-col items-start gap-1 min-w-[8rem] rounded-md border border-surface-200 dark:border-surface-700 px-4 py-3"
          >
            <span class="text-xs uppercase text-surface-500">
              {{ t(`modules.admin.tasks.stats.${metric.key}`) }}
            </span>
            <span class="text-2xl font-semibold" :class="metric.colour">{{ metric.value }}</span>
          </div>
          <div class="flex items-end gap-3 ml-auto">
            <span class="flex items-center gap-2 text-xs uppercase">
              <span
                aria-hidden="true"
                :class="['inline-block w-2 h-2 rounded-full', socketLive ? 'bg-emerald-500' : 'bg-amber-500']"
              />
              {{ socketLive ? t('modules.admin.tasks.live.live') : t('modules.admin.tasks.live.offline') }}
            </span>
            <Button icon="pi pi-refresh" :label="t('modules.admin.tasks.stats.refresh')" outlined @click="refresh" />
          </div>
        </div>
      </CardComponent>

      <CardComponent :header="t('modules.admin.tasks.list.header')">
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase text-surface-500">
                {{ t('modules.admin.tasks.filters.status') }}
              </label>
              <SelectButton
                v-model="selectedStatuses"
                multiple
                option-label="label"
                option-value="value"
                :options="statusOptions"
                @update:model-value="onFilterChange"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs uppercase text-surface-500">
                {{ t('modules.admin.tasks.filters.type') }}
              </label>
              <InputText
                v-model="typeFilter"
                :placeholder="t('modules.admin.tasks.filters.typePlaceholder')"
                @blur="onFilterChange"
                @keyup.enter="onFilterChange"
              />
            </div>
          </div>

          <DataTable
            data-key="id"
            lazy
            :loading="tasksStore.loading"
            :paginator="true"
            :rows="rows"
            :rows-per-page-options="[10, 25, 50, 100]"
            :total-records="tasksStore.total"
            :value="tasksStore.tasks"
            @page="onPage($event)"
          >
            <template #empty>
              {{ t('modules.admin.tasks.list.empty') }}
            </template>
            <Column field="id" :header="t('modules.admin.tasks.columns.id')" style="width: 5rem" />
            <Column field="type" :header="t('modules.admin.tasks.columns.type')" />
            <Column field="status" :header="t('modules.admin.tasks.columns.status')">
              <template #body="slotProps">
                <Tag
                  :severity="statusSeverity(slotProps.data.status)"
                  :value="t(`modules.admin.tasks.status.${slotProps.data.status}`)"
                />
              </template>
            </Column>
            <Column :header="t('modules.admin.tasks.columns.attempts')" style="width: 7rem">
              <template #body="slotProps">
                {{ `${slotProps.data.attempts} / ${slotProps.data.maxAttempts}` }}
              </template>
            </Column>
            <Column field="createdAt" :header="t('modules.admin.tasks.columns.createdAt')">
              <template #body="slotProps">
                {{ formatDate(slotProps.data.createdAt) }}
              </template>
            </Column>
            <Column field="lastError" :header="t('modules.admin.tasks.columns.lastError')">
              <template #body="slotProps">
                <span class="text-sm break-words" :title="slotProps.data.lastError || ''">
                  {{ truncate(slotProps.data.lastError) }}
                </span>
              </template>
            </Column>
            <Column :header="t('modules.admin.tasks.columns.actions')" style="width: 11rem">
              <template #body="slotProps">
                <div class="flex gap-2">
                  <Button
                    :aria-label="t('modules.admin.tasks.details.open')"
                    icon="pi pi-info-circle"
                    outlined
                    severity="secondary"
                    size="small"
                    :title="t('modules.admin.tasks.details.open')"
                    @click="openDetails(slotProps.data)"
                  />
                  <Button
                    v-if="slotProps.data.status === 'failed'"
                    icon="pi pi-replay"
                    :label="t('modules.admin.tasks.retry')"
                    size="small"
                    @click="confirmRetry(slotProps.data.id)"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </CardComponent>
    </div>

    <ConfirmDialog group="task-retry" />

    <Dialog
      v-model:visible="detailDialogVisible"
      :dismissable-mask="true"
      :header="detailTask ? t('modules.admin.tasks.details.title', { id: detailTask.id }) : ''"
      modal
      :style="{ width: '38rem' }"
    >
      <div v-if="detailTask" class="flex flex-col gap-4">
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <span class="text-surface-500">{{ t('modules.admin.tasks.details.id') }}</span>
          <span>{{ detailTask.id }}</span>

          <span class="text-surface-500">{{ t('modules.admin.tasks.details.type') }}</span>
          <span>{{ detailTask.type }}</span>

          <span class="text-surface-500">{{ t('modules.admin.tasks.details.status') }}</span>
          <span>
            <Tag
              :severity="statusSeverity(detailTask.status)"
              :value="t(`modules.admin.tasks.status.${detailTask.status}`)"
            />
          </span>

          <span class="text-surface-500">{{ t('modules.admin.tasks.details.attempts') }}</span>
          <span>{{ `${detailTask.attempts} / ${detailTask.maxAttempts}` }}</span>

          <span class="text-surface-500">{{ t('modules.admin.tasks.details.createdAt') }}</span>
          <span>{{ formatDateOrNone(detailTask.createdAt) }}</span>

          <span class="text-surface-500">{{ t('modules.admin.tasks.details.updatedAt') }}</span>
          <span>{{ formatDateOrNone(detailTask.updatedAt) }}</span>

          <span class="text-surface-500">{{ t('modules.admin.tasks.details.availableAt') }}</span>
          <span>{{ formatDateOrNone(detailTask.availableAt) }}</span>

          <span class="text-surface-500">{{ t('modules.admin.tasks.details.startedAt') }}</span>
          <span>{{ formatDateOrNone(detailTask.startedAt) }}</span>

          <span class="text-surface-500">{{ t('modules.admin.tasks.details.completedAt') }}</span>
          <span>{{ formatDateOrNone(detailTask.completedAt) }}</span>
        </div>

        <div v-if="detailTask.lastError">
          <div class="text-xs uppercase text-surface-500 mb-1">
            {{ t('modules.admin.tasks.details.lastError') }}
          </div>
          <pre
            class="rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-200 p-3 text-xs whitespace-pre-wrap break-words"
            >{{ detailTask.lastError }}</pre>
        </div>
      </div>
    </Dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useWebSocketStore } from '@sudosos/sudosos-frontend-common';
import DataTable, { type DataTablePageEvent } from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { AxiosError } from 'axios';
import type { TaskResponse } from '@gewis/sudosos-client';
import PageContainer from '@/layout/PageContainer.vue';
import CardComponent from '@/components/CardComponent.vue';
import { useTasksStore, type TaskStatus } from '@/stores/tasks.store';

const TASK_ROOM = 'tasks:all';
const TASK_EVENT = 'task:updated';

const { t } = useI18n();
const tasksStore = useTasksStore();
const toast = useToast();
const confirm = useConfirm();
const webSocketStore = useWebSocketStore();
const { connected: socketLive } = storeToRefs(webSocketStore);

const rows = ref(25);
const skip = ref(0);
const selectedStatuses = ref<TaskStatus[]>([]);
const typeFilter = ref('');

const detailDialogVisible = ref(false);
const detailTask = ref<TaskResponse | null>(null);

const statusOptions = computed(() =>
  (['pending', 'processing', 'completed', 'failed'] as TaskStatus[]).map((value) => ({
    value,
    label: t(`modules.admin.tasks.status.${value}`),
  })),
);

const metrics = computed(() => [
  { key: 'pending', value: tasksStore.stats.pending, colour: 'text-amber-600' },
  { key: 'processing', value: tasksStore.stats.processing, colour: 'text-sky-600' },
  { key: 'completed', value: tasksStore.stats.completed, colour: 'text-emerald-600' },
  { key: 'failed', value: tasksStore.stats.failed, colour: 'text-rose-600' },
]);

const statusSeverity = (status: string): 'info' | 'warn' | 'success' | 'danger' | 'secondary' => {
  switch (status) {
    case 'pending':
      return 'warn';
    case 'processing':
      return 'info';
    case 'completed':
      return 'success';
    case 'failed':
      return 'danger';
    default:
      return 'secondary';
  }
};

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : '');
const formatDateOrNone = (value?: string | null) =>
  value ? new Date(value).toLocaleString() : t('modules.admin.tasks.details.none');
const truncate = (value?: string | null) => {
  if (!value) return '';
  return value.length > 80 ? `${value.slice(0, 80)}...` : value;
};

const buildFilters = () => ({
  status: selectedStatuses.value.length > 0 ? selectedStatuses.value : undefined,
  type: typeFilter.value.trim() ? typeFilter.value.trim() : undefined,
});

// Debounced stats refresh so a burst of WebSocket events doesn't pummel the API.
let statsTimer: ReturnType<typeof setTimeout> | null = null;
const refreshStatsDebounced = () => {
  if (statsTimer) clearTimeout(statsTimer);
  statsTimer = setTimeout(() => {
    void tasksStore.fetchStats();
  }, 250);
};

const reload = async () => {
  try {
    await Promise.all([
      tasksStore.fetchTasks({ filters: buildFilters(), take: rows.value, skip: skip.value }),
      tasksStore.fetchStats(),
    ]);
  } catch (err) {
    const message = err instanceof AxiosError ? err.message : String(err);
    toast.add({
      severity: 'error',
      summary: t('modules.admin.tasks.toast.loadError', { error: message }),
      life: 4000,
    });
  }
};

const onPage = (event: DataTablePageEvent) => {
  rows.value = event.rows;
  skip.value = event.first;
  void reload();
};

const onFilterChange = () => {
  skip.value = 0;
  void reload();
};

const refresh = () => {
  void reload();
};

const passesFilters = (task: TaskResponse): boolean => {
  const filters = buildFilters();
  if (filters.status && !filters.status.includes(task.status as TaskStatus)) return false;
  if (filters.type && task.type !== filters.type) return false;
  return true;
};

const onTaskUpdated = (task: TaskResponse) => {
  if (!detailTask.value || detailTask.value.id !== task.id) {
    // Update the dialog if it's open on this task.
  } else {
    detailTask.value = task;
  }
  if (passesFilters(task)) {
    tasksStore.applyUpdate(task);
  }
  refreshStatsDebounced();
};

const openDetails = (task: TaskResponse) => {
  detailTask.value = task;
  detailDialogVisible.value = true;
};

const confirmRetry = (id: number) => {
  confirm.require({
    group: 'task-retry',
    header: t('modules.admin.tasks.retryConfirmTitle'),
    message: t('modules.admin.tasks.retryConfirmMessage', { id }),
    accept: () => {
      void (async () => {
        try {
          await tasksStore.retryTask(id);
          toast.add({
            severity: 'success',
            summary: t('modules.admin.tasks.toast.retried'),
            life: 3000,
          });
        } catch (err) {
          const message = err instanceof AxiosError ? err.message : String(err);
          toast.add({
            severity: 'error',
            summary: t('modules.admin.tasks.toast.retryError', { error: message }),
            life: 4000,
          });
        }
      })();
    },
  });
};

// WebSocket subscription wiring. The socket itself is set up by the
// `setupWebSocket` call in `beforeLoad`; here we just join the task room
// while the view is mounted and tear down on unmount.
const onSocketConnect = () => {
  try {
    webSocketStore.getSocket.emit('subscribe', TASK_ROOM);
  } catch {
    // socket not yet ready; the connect handler below covers reconnects.
  }
};

onMounted(() => {
  void reload();
  try {
    const socket = webSocketStore.getSocket;
    socket.on(TASK_EVENT, onTaskUpdated);
    socket.on('connect', onSocketConnect);
    if (socket.connected) {
      onSocketConnect();
    }
  } catch {
    // No socket configured (e.g. SSR build); falls back to manual refresh.
  }
});

onBeforeUnmount(() => {
  if (statsTimer) clearTimeout(statsTimer);
  try {
    const socket = webSocketStore.getSocket;
    socket.emit('unsubscribe', TASK_ROOM);
    socket.off(TASK_EVENT, onTaskUpdated);
    socket.off('connect', onSocketConnect);
  } catch {
    // socket not initialised; nothing to clean up.
  }
});
</script>
