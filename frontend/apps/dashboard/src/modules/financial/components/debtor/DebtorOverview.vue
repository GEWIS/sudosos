<template>
  <CardComponent class="w-full" :header="t('modules.financial.debtor.overview.title')">
    <!-- Inside the card so the component has a single root, which the fine round transition needs -->
    <ConfirmDialog group="debtorOverview" />
    <div class="flex flex-wrap gap-4 items-center justify-between mb-4">
      <div class="flex gap-2 items-center">
        <ToggleSwitch v-model="hideSmallDebts" input-id="hideSmallDebts" />
        <label for="hideSmallDebts">{{ t('modules.financial.debtor.overview.hideSmallDebts') }}</label>
      </div>
      <div class="flex flex-wrap gap-2">
        <Button
          v-if="canHandout"
          icon="pi pi-play"
          :label="t('modules.financial.debtor.fineRound.start')"
          outlined
          @click="emit('startFineRound')"
        />
        <Button
          v-if="canNotify"
          :disabled="selectedRows.length === 0"
          icon="pi pi-envelope"
          :label="t('modules.financial.debtor.overview.warn', { count: selectedRows.length })"
          :loading="isNotifying"
          @click="startWarn"
        />
      </div>
    </div>
    <DataTable
      v-model:selection="selectedRows"
      data-key="user.id"
      :loading="isLoading"
      scroll-height="30rem"
      scrollable
      sort-field="user.amount.amount"
      :sort-order="1"
      striped-rows
      :value="visibleRows"
    >
      <template #empty>{{ t('modules.financial.debtor.overview.empty') }}</template>
      <Column v-if="canNotify" selection-mode="multiple" style="width: 3rem" />
      <Column field="user.memberId" :header="t('common.gewisId')">
        <template #body="{ data }">
          <ExternalLink
            v-if="data.user.memberId"
            :text="data.user.memberId"
            :url="getGewisMemberUrl(data.user.memberId, locale)"
          />
        </template>
      </Column>
      <Column field="name" :header="t('common.name')" sortable>
        <template #body="{ data }">
          <UserLink new-tab :user="data.user" />
        </template>
      </Column>
      <Column field="user.amount.amount" :header="t('modules.financial.debtor.debtorUsers.currentBalance')" sortable>
        <template #body="{ data }">{{ formatPrice(data.user.amount) }}</template>
      </Column>
      <Column field="fineAmount" :header="t('modules.financial.debtor.debtorUsers.unpaidFines')" sortable>
        <template #body="{ data }">{{ data.fineAmount > 0 ? formatPrice(euro(data.fineAmount)) : '' }}</template>
      </Column>
      <Column field="user.fineSince" :header="t('modules.financial.debtor.debtorUsers.finedSince')" sortable>
        <template #body="{ data }">
          <span v-if="data.user.fineSince" class="font-bold text-red-500">
            {{ formatFineTimeSince(new Date(data.user.fineSince), now) }}
          </span>
        </template>
      </Column>
    </DataTable>
    <p class="font-bold mt-2">
      {{
        t('modules.financial.debtor.overview.total', {
          count: visibleRows.length,
          amount: formatPrice(euro(visibleRows.reduce((sum, r) => sum + r.user.amount.amount, 0))),
        })
      }}
    </p>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import type { AxiosError } from 'axios';
import type { BalanceResponse } from '@gewis/sudosos-client';
import { fetchAllPages, isAllowed } from '@sudosos/sudosos-frontend-common';
import ApiService from '@/services/ApiService';
import { FINEABLE_USER_TYPES } from '@/stores/debtor.store';
import { formatFineTimeSince, formatPrice } from '@/utils/formatterUtils';
import { handleError } from '@/utils/errorUtils';
import { getGewisMemberUrl } from '@/utils/urlUtils';
import CardComponent from '@/components/CardComponent.vue';
import ExternalLink from '@/components/ExternalLink.vue';
import UserLink from '@/components/UserLink.vue';

const emit = defineEmits<{ startFineRound: [] }>();

const { t, locale } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const canNotify = isAllowed('notify', ['all'], 'Fine', ['any']);
const canHandout = isAllowed('update', ['all'], 'Fine', ['any']);

// Balances from -5.00 up to -0.01 can be hidden; fines only apply from -5.00 down
const SMALL_DEBT_LIMIT = -500;

interface DebtorRow {
  user: BalanceResponse;
  name: string;
  fineAmount: number;
}

const rows = ref<DebtorRow[]>([]);
const selectedRows = ref<DebtorRow[]>([]);
const hideSmallDebts = ref(false);
const isLoading = ref(true);
const isNotifying = ref(false);
const now = new Date();

const visibleRows = computed(() =>
  hideSmallDebts.value ? rows.value.filter((r) => r.user.amount.amount <= SMALL_DEBT_LIMIT) : rows.value,
);

watch(visibleRows, (visible) => {
  selectedRows.value = [...visible];
});

onMounted(async () => {
  try {
    const balances = await fetchAllPages<BalanceResponse>((take, skip) =>
      ApiService.balance.getAllBalance({ maxBalance: -1, userTypes: FINEABLE_USER_TYPES, take, skip }),
    );
    rows.value = balances.map((b) => ({
      user: b,
      name: `${b.firstName} ${b.lastName}`,
      // Waived fines are reported separately and still have to be subtracted
      fineAmount: (b.fine?.amount ?? 0) - (b.fineWaived?.amount ?? 0),
    }));
  } catch (err) {
    handleError(err as AxiosError, toast);
  } finally {
    isLoading.value = false;
  }
});

function euro(amount: number) {
  return { amount, currency: 'EUR', precision: 2 };
}

function startWarn() {
  const userIds = selectedRows.value.map((r) => r.user.id);
  confirm.require({
    group: 'debtorOverview',
    header: t('common.areYouSure'),
    message: t('modules.financial.debtor.overview.confirmWarn', { count: userIds.length }),
    icon: 'pi pi-question-circle',
    acceptLabel: t('modules.financial.debtor.overview.warn', { count: userIds.length }),
    rejectLabel: t('common.cancel'),
    accept: () => void warn(userIds),
  });
}

async function warn(userIds: number[]) {
  isNotifying.value = true;
  try {
    await ApiService.debtor.notifyAboutDebt({ notifyDebtRequest: { userIds } });
    toast.add({
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.debtNotificationsSent'),
      life: 3000,
      severity: 'success',
    });
  } catch (err) {
    handleError(err as AxiosError, toast);
  } finally {
    isNotifying.value = false;
  }
}
</script>
