<template>
  <CardComponent class="w-full" :header="t('modules.financial.administrative.eligibleUsers.title')">
    <div class="flex flex-col gap-4">
      <!-- Mode Selection -->
      <div class="flex flex-row gap-2 align-items-center flex-wrap">
        <Button
          :label="t('modules.financial.administrative.eligibleUsers.notificationMode')"
          :outlined="mode !== 'notification'"
          :severity="mode === 'notification' ? undefined : 'secondary'"
          @click="mode = 'notification'"
        />
        <Button
          :label="t('modules.financial.administrative.eligibleUsers.handoutMode')"
          :outlined="mode !== 'handout'"
          :severity="mode === 'handout' ? undefined : 'secondary'"
          @click="mode = 'handout'"
        />
        <Button
          :icon="isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"
          :label="t('common.refresh')"
          outlined
          @click="loadEligibleUsers"
        />
      </div>

      <!-- Information Message -->
      <Message
        :closable="false"
        :icon="mode === 'notification' ? 'pi pi-info-circle' : 'pi pi-exclamation-triangle'"
        :severity="mode === 'notification' ? 'info' : 'warn'"
      >
        <div class="flex flex-col gap-1">
          <span class="font-bold">{{ t(`modules.financial.administrative.eligibleUsers.${mode}.infoTitle`) }}</span>
          <span>{{ t(`modules.financial.administrative.eligibleUsers.${mode}.infoMessage`) }}</span>
        </div>
      </Message>

      <DataTable
        v-model:selection="selectedUserIds"
        data-key="id"
        :first="first"
        lazy
        :loading="isLoading"
        paginator
        :rows="rows"
        :rows-per-page-options="[10, 25, 50, 100]"
        selection-mode="multiple"
        table-style="min-width: 50rem"
        :total-records="eligibleUsers.length"
        :value="paginatedUsers"
        @page="onPage"
      >
        <template #header>
          <div class="flex flex-row items-center justify-between w-full">
            <div class="max-w-20rem">
              <Skeleton v-if="isLoading" class="w-8 h-1rem" />
              <span v-else>{{
                t('modules.financial.administrative.eligibleUsers.count', { count: eligibleUsers.length })
              }}</span>
            </div>
            <div class="flex flex-row gap-2">
              <Button :label="t('common.selectAll')" outlined @click="selectAll" />
              <Button :label="t('common.clearSelection')" outlined @click="clearSelection" />
            </div>
          </div>
        </template>

        <Column selection-mode="multiple" style="width: 3rem" />

        <Column field="user" :header="t('common.name')">
          <template #body="slotProps">
            <Skeleton v-if="isLoading || !slotProps.data" class="w-6 my-1 h-1rem surface-300" />
            <UserLink v-else :user="slotProps.data" />
          </template>
        </Column>
      </DataTable>

      <div v-if="selectedUserIds.length > 0" class="flex flex-row justify-end gap-2">
        <Button
          v-if="mode === 'notification'"
          :disabled="isNotifyLoading"
          :label="t('modules.financial.administrative.eligibleUsers.notify')"
          :loading="isNotifyLoading"
          @click="handleNotify"
        />
        <Button
          v-if="mode === 'handout'"
          :disabled="isHandoutLoading"
          :label="t('modules.financial.administrative.eligibleUsers.handoutButton')"
          :loading="isHandoutLoading"
          @click="handleHandout"
        />
      </div>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import type { UserToInactiveAdministrativeCostResponse } from '@sudosos/sudosos-client';
import type { DataTablePageEvent } from 'primevue/datatable';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Skeleton from 'primevue/skeleton';
import Message from 'primevue/message';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { AxiosError } from 'axios';
import CardComponent from '@/components/CardComponent.vue';
import UserLink from '@/components/UserLink.vue';
import { useAdministrativeCostsStore } from '@/stores/administrativeCosts.store';
import { handleError } from '@/utils/errorUtils';

const emit = defineEmits<{
  costsUpdated: [];
}>();

const { t } = useI18n();
const confirm = useConfirm();
const toast = useToast();
const store = useAdministrativeCostsStore();

const mode = ref<'notification' | 'handout'>('notification');
const selectedUserIds = ref<UserToInactiveAdministrativeCostResponse[]>([]);
const rows = ref(10);
const first = ref(0);

const eligibleUsers = computed(() => store.eligibleUsers);
const isLoading = computed(() => store.isEligibleUsersLoading);
const isNotifyLoading = computed(() => store.isNotifyLoading);
const isHandoutLoading = computed(() => store.isHandoutLoading);

const paginatedUsers = computed(() => {
  if (isLoading.value) {
    return Array(rows.value).fill(null);
  }
  return eligibleUsers.value.slice(first.value, first.value + rows.value);
});

async function loadEligibleUsers() {
  try {
    await store.fetchEligibleUsers(mode.value === 'notification');
    first.value = 0;
    selectedUserIds.value = [];
  } catch (err) {
    if (err instanceof AxiosError) {
      handleError(err, toast);
    } else {
      console.error(err);
    }
  }
}

function selectAll() {
  selectedUserIds.value = [...eligibleUsers.value];
}

function clearSelection() {
  selectedUserIds.value = [];
}

function onPage(event: DataTablePageEvent) {
  first.value = event.first;
  rows.value = event.rows;
}

function handleNotify() {
  if (selectedUserIds.value.length === 0) return;

  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.administrative.eligibleUsers.confirm.notify', {
      count: selectedUserIds.value.length,
    }),
    acceptLabel: t('modules.financial.administrative.eligibleUsers.notify'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      void (async () => {
        confirm.close();
        try {
          await store.notifyUsers({
            userIds: selectedUserIds.value.map((u) => u.id),
          });
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('modules.financial.administrative.eligibleUsers.notifySuccess'),
            severity: 'success',
            life: 3000,
          });
          selectedUserIds.value = [];
          await loadEligibleUsers();
        } catch (err) {
          if (err instanceof AxiosError) {
            handleError(err, toast);
          } else {
            console.error(err);
          }
        }
      })();
    },
  });
}

function handleHandout() {
  if (selectedUserIds.value.length === 0) return;

  confirm.require({
    header: t('common.areYouSure'),
    message: t('modules.financial.administrative.eligibleUsers.confirm.handout', {
      count: selectedUserIds.value.length,
    }),
    acceptLabel: t('modules.financial.administrative.eligibleUsers.handoutButton'),
    rejectLabel: t('common.cancel'),
    accept: () => {
      void (async () => {
        confirm.close();
        try {
          await store.handoutCosts({
            userIds: selectedUserIds.value.map((u) => u.id),
          });
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('modules.financial.administrative.eligibleUsers.handoutSuccess', {
              count: selectedUserIds.value.length,
            }),
            severity: 'success',
            life: 3000,
          });
          selectedUserIds.value = [];
          await loadEligibleUsers();
          emit('costsUpdated');
        } catch (err) {
          if (err instanceof AxiosError) {
            handleError(err, toast);
          } else {
            console.error(err);
          }
        }
      })();
    },
  });
}

onMounted(() => {
  void loadEligibleUsers();
});

watch(
  mode,
  () => {
    selectedUserIds.value = [];
    first.value = 0;
    void loadEligibleUsers();
  },
  { immediate: false },
);
</script>

<style scoped lang="scss"></style>
