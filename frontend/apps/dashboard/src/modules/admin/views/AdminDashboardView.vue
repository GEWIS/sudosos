<template>
  <PageContainer>
    <div class="mb-3">
      <h1 class="text-2xl font-semibold">
        {{ t('modules.admin.dashboard.welcome', { name: currentUser?.firstName }) }}
      </h1>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Balance Overview (full width) -->
      <CardComponent class="md:col-span-2" :header="t('modules.admin.dashboard.balanceSummary.title')">
        <template #topAction>
          <i
            v-tooltip.left="t('modules.admin.dashboard.balanceSummary.tooltip')"
            class="pi pi-info-circle cursor-help text-muted-color"
          />
        </template>
        <div class="flex flex-row items-stretch">
          <!-- Balance figures -->
          <div class="w-1/2">
            <div v-if="loadingBalance" class="flex flex-row gap-8">
              <Skeleton v-for="i in 2" :key="i" height="3rem" width="12rem" />
            </div>
            <div v-else-if="filteredTotalPositive && filteredTotalNegative" class="flex flex-row gap-12 py-2">
              <div class="flex flex-col gap-1">
                <span class="text-sm text-muted-color">{{
                  t('modules.admin.dashboard.balanceSummary.totalPositive')
                }}</span>
                <span class="text-2xl font-bold text-green-600">{{ formatDineroObject(filteredTotalPositive) }}</span>
              </div>
              <div class="flex flex-col gap-1">
                <span class="text-sm text-muted-color">{{
                  t('modules.admin.dashboard.balanceSummary.totalNegative')
                }}</span>
                <span class="text-2xl font-bold text-red-500">{{ formatDineroObject(filteredTotalNegative) }}</span>
              </div>
            </div>
            <div v-else class="py-2 text-sm text-muted-color">
              {{ t('modules.admin.dashboard.balanceSummary.unavailable') }}
            </div>
          </div>

          <Divider layout="vertical" />

          <!-- Financial overview CTA -->
          <div class="flex w-1/2 flex-col items-center justify-center gap-2 px-6">
            <Button
              disabled
              icon="pi pi-chart-bar"
              icon-pos="right"
              :label="t('modules.admin.dashboard.balanceSummary.financialOverview')"
            />
            <span class="text-sm text-muted-color"
              >🚧 {{ t('modules.admin.dashboard.balanceSummary.underConstruction') }} 🚧</span
            >
          </div>
        </div>
      </CardComponent>

      <!-- Invoice Accounts with Negative Balance -->
      <CardComponent :header="t('modules.admin.dashboard.negativeInvoiceAccounts.title')">
        <template #topAction>
          <Badge
            v-if="!loadingNegativeAccounts && negativeAccountCount > 0"
            severity="danger"
            :value="negativeAccountCount"
          />
        </template>
        <div v-if="loadingNegativeAccounts" class="flex flex-col gap-2">
          <Skeleton v-for="i in 3" :key="i" class="w-full" height="2rem" />
        </div>
        <template v-else>
          <p v-if="negativeAccountCount === 0" class="flex h-full items-center justify-center text-muted-color">
            {{ t('modules.admin.dashboard.empty') }}
          </p>
          <DataTable v-else size="small" :value="negativeAccountsPreview">
            <Column field="firstName" :header="t('common.name')" />
            <Column :header="t('modules.financial.invoice.account.balance')">
              <template #body="{ data }">
                <span class="text-red-500">{{ formatPrice(data.amount) }}</span>
              </template>
            </Column>
            <Column style="width: 3rem">
              <template #body="{ data }">
                <Button
                  v-tooltip="t('modules.financial.invoice.create.create')"
                  class="p-button-plain p-button-rounded p-button-text"
                  icon="pi pi-file-edit"
                  type="button"
                  @click="navigateToInvoiceCreate(data.id)"
                />
              </template>
            </Column>
          </DataTable>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <Button
              icon="pi pi-arrow-right"
              icon-pos="right"
              :label="t('modules.admin.dashboard.viewAll')"
              severity="secondary"
              text
              @click="() => router.push({ name: 'invoices' })"
            />
          </div>
        </template>
      </CardComponent>

      <!-- Pending Invoices -->
      <CardComponent :header="t('modules.admin.dashboard.pendingInvoices.title')">
        <template #topAction>
          <Badge v-if="!loadingInvoices && pendingInvoicesTotal > 0" severity="warn" :value="pendingInvoicesTotal" />
        </template>
        <div v-if="loadingInvoices" class="flex flex-col gap-2">
          <Skeleton v-for="i in 3" :key="i" class="w-full" height="2rem" />
        </div>
        <template v-else>
          <p v-if="pendingInvoices.length === 0" class="flex h-full items-center justify-center text-muted-color">
            {{ t('modules.admin.dashboard.empty') }}
          </p>
          <DataTable v-else size="small" :value="pendingInvoices">
            <Column :header="t('common.description')" style="max-width: 12rem">
              <template #body="{ data }">
                <router-link
                  v-tooltip.top="data.description"
                  class="text-primary hover:underline block truncate max-w-[12rem]"
                  :to="{ name: 'invoiceInfo', params: { id: data.id } }"
                  >{{ data.description }}</router-link
                >
              </template>
            </Column>
            <Column :header="t('common.date')">
              <template #body="{ data }">{{ formatDateFromString(data.date) }}</template>
            </Column>
          </DataTable>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <Button
              icon="pi pi-arrow-right"
              icon-pos="right"
              :label="t('modules.admin.dashboard.viewAll')"
              severity="secondary"
              text
              @click="() => router.push({ name: 'invoices' })"
            />
          </div>
        </template>
      </CardComponent>

      <!-- Users Eligible for Fines -->
      <CardComponent :header="t('modules.admin.dashboard.debtors.title')">
        <template #topAction>
          <Badge
            v-if="!debtorStore.isDebtorsLoading && debtorStore.allDebtors.length > 0"
            severity="danger"
            :value="debtorStore.allDebtors.length"
          />
        </template>
        <div v-if="debtorStore.isDebtorsLoading" class="flex flex-col gap-2">
          <Skeleton v-for="i in 3" :key="i" class="w-full" height="2rem" />
        </div>
        <template v-else>
          <p
            v-if="debtorStore.allDebtors.length === 0"
            class="flex h-full items-center justify-center text-muted-color"
          >
            {{ t('modules.admin.dashboard.empty') }}
          </p>
          <div v-else class="flex flex-col gap-3 pt-2">
            <div class="flex justify-between items-center">
              <span>{{ t('modules.admin.dashboard.debtors.totalDebt') }}</span>
              <span class="font-bold text-red-500">{{ formatPrice(debtorStore.totalDebt) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span>{{ t('modules.admin.dashboard.debtors.totalFine') }}</span>
              <span class="font-bold">{{ formatPrice(debtorStore.totalFine) }}</span>
            </div>
          </div>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <Button
              icon="pi pi-arrow-right"
              icon-pos="right"
              :label="t('modules.admin.dashboard.debtors.handoutFines')"
              severity="secondary"
              text
              @click="() => router.push({ name: 'Debtors' })"
            />
          </div>
        </template>
      </CardComponent>

      <!-- Pending Payout Requests -->
      <CardComponent :header="t('modules.admin.dashboard.pendingPayouts.title')">
        <template #topAction>
          <Badge v-if="!loadingPayouts && pendingPayoutsTotal > 0" severity="warn" :value="pendingPayoutsTotal" />
        </template>
        <div v-if="loadingPayouts" class="flex flex-col gap-2">
          <Skeleton v-for="i in 3" :key="i" class="w-full" height="2rem" />
        </div>
        <template v-else>
          <p v-if="pendingPayouts.length === 0" class="flex h-full items-center justify-center text-muted-color">
            {{ t('modules.admin.dashboard.empty') }}
          </p>
          <DataTable v-else size="small" :value="pendingPayouts">
            <Column field="requestedBy.firstName" :header="t('modules.financial.payout.requestedBy')" />
            <Column :header="t('common.amount')">
              <template #body="{ data }">{{ formatPrice(data.amount) }}</template>
            </Column>
            <Column :header="t('common.date')">
              <template #body="{ data }">{{ formatDateFromString(data.createdAt) }}</template>
            </Column>
          </DataTable>
        </template>
        <template #footer>
          <div class="flex justify-end">
            <Button
              icon="pi pi-arrow-right"
              icon-pos="right"
              :label="t('modules.admin.dashboard.viewAll')"
              severity="secondary"
              text
              @click="() => router.push({ name: 'payouts' })"
            />
          </div>
        </template>
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { InvoiceStatusResponseStateEnum } from '@gewis/sudosos-client';
import type {
  BasePayoutRequestResponse,
  BalanceResponse,
  DineroObjectResponse,
  InvoiceResponse,
  TotalBalanceResponse,
  UserTypeTotalBalanceResponse,
} from '@gewis/sudosos-client';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Skeleton from 'primevue/skeleton';
import Badge from 'primevue/badge';
import Divider from 'primevue/divider';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import PageContainer from '@/layout/PageContainer.vue';
import CardComponent from '@/components/CardComponent.vue';
import { formatPrice, formatDateFromString, formatDineroObject } from '@/utils/formatterUtils';
import { usePayoutStore } from '@/stores/payout.store';
import { useInvoiceStore } from '@/stores/invoice.store';
import { useDebtorStore } from '@/stores/debtor.store';
import apiService from '@/services/ApiService';
import router from '@/router';

const { t } = useI18n();

const authStore = useAuthStore();
const payoutStore = usePayoutStore();
const invoiceStore = useInvoiceStore();
const debtorStore = useDebtorStore();

const currentUser = computed(() => authStore.getUser);

// Balance summary
const loadingBalance = ref(true);
const totalBalanceData = ref<TotalBalanceResponse | null>(null);

const BALANCE_USER_TYPES = ['MEMBER', 'LOCAL_USER'];

const filteredUserTypeBalances = computed<UserTypeTotalBalanceResponse[]>(() => {
  if (!totalBalanceData.value) return [];
  const all = (totalBalanceData.value.userTypeBalances as unknown as UserTypeTotalBalanceResponse[]) ?? [];
  return all.filter((b) => BALANCE_USER_TYPES.includes(b.userType));
});

const filteredTotalPositive = computed<DineroObjectResponse | null>(() => {
  const first = filteredUserTypeBalances.value[0];
  if (!first) return null;
  return {
    ...first.totalPositive,
    amount: filteredUserTypeBalances.value.reduce((sum, b) => sum + b.totalPositive.amount, 0),
  };
});

const filteredTotalNegative = computed<DineroObjectResponse | null>(() => {
  const first = filteredUserTypeBalances.value[0];
  if (!first) return null;
  return {
    ...first.totalNegative,
    amount: filteredUserTypeBalances.value.reduce((sum, b) => sum + b.totalNegative.amount, 0),
  };
});

// Pending payouts
const loadingPayouts = ref(true);
const pendingPayouts = ref<BasePayoutRequestResponse[]>([]);
const pendingPayoutsTotal = ref(0);

// Pending invoices
const loadingInvoices = ref(true);
const pendingInvoices = ref<InvoiceResponse[]>([]);
const pendingInvoicesTotal = ref(0);

// Negative invoice accounts
const loadingNegativeAccounts = ref(true);
const negativeAccounts = computed<BalanceResponse[]>(() => Object.values(invoiceStore.negativeInvoiceUsers));
const negativeAccountCount = computed(() => negativeAccounts.value.length);
const negativeAccountsPreview = computed(() => negativeAccounts.value.slice(0, 5));

const navigateToInvoiceCreate = (userId: number) => {
  void router.push({ name: 'invoiceCreate', query: { userId } });
};

onMounted(async () => {
  const now = new Date();
  await Promise.allSettled([
    apiService.balance
      .calculateTotalBalances({ date: now.toISOString().split('T')[0] ?? '' })
      .then((res) => {
        totalBalanceData.value = res.data;
      })
      .catch((err) => {
        console.warn('[AdminDashboard] calculateTotalBalances failed:', err);
      })
      .finally(() => {
        loadingBalance.value = false;
      }),

    payoutStore
      .fetchPayouts(5, 0, 'CREATED')
      .then((res) => {
        pendingPayouts.value = res.records;
        pendingPayoutsTotal.value = res._pagination.count ?? 0;
      })
      .finally(() => {
        loadingPayouts.value = false;
      }),

    invoiceStore
      .fetchInvoices(5, 0, { state: InvoiceStatusResponseStateEnum.Created })
      .then((res) => {
        pendingInvoices.value = res.records as InvoiceResponse[];
        pendingInvoicesTotal.value = res._pagination.count ?? 0;
      })
      .finally(() => {
        loadingInvoices.value = false;
      }),

    invoiceStore.fetchUsersIfEmpty().finally(() => {
      loadingNegativeAccounts.value = false;
    }),

    debtorStore.fetchCalculatedFines(now, now),
  ]);
});
</script>

<style scoped lang="scss"></style>
