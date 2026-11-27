<template>
  <PageContainer>
    <ConfirmDialog group="tabDetail" />
    <div v-if="!tab" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>
    <div v-else class="flex flex-col gap-5">
      <CardComponent class="w-full" :header="tab.name" :subtitle="t('modules.financial.tab.detail.subtitle')">
        <template #topAction>
          <Tag :severity="TAB_STATUS_SEVERITY[tab.status]" :value="t(`modules.financial.tab.status.${tab.status}`)" />
        </template>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div class="font-semibold">{{ t('modules.financial.tab.contact') }}</div>
            <div>{{ tab.contactName }}</div>
            <div class="text-muted-color">{{ tab.contactEmail }}</div>
          </div>
          <div>
            <div class="font-semibold">{{ t('modules.financial.tab.outstanding') }}</div>
            <div class="text-2xl">{{ formatDineroObject(tab.outstanding) }}</div>
          </div>
          <div>
            <div class="font-semibold">{{ t('modules.financial.tab.detail.openedBy') }}</div>
            <div>{{ tab.createdBy.firstName }} {{ tab.createdBy.lastName }}</div>
            <div class="text-muted-color">{{ tab.createdAt ? formatDateAndTime(tab.createdAt) : '' }}</div>
          </div>
          <div v-if="settledAt">
            <div class="font-semibold">{{ t(`modules.financial.tab.status.${tab.status}`) }}</div>
            <div>{{ formatDateAndTime(settledAt) }}</div>
          </div>
        </div>

        <Message v-if="tab.status === 'LOCKED'" class="mt-4" :icon="undefined" severity="warn">
          {{ t('modules.financial.tab.detail.lockedHint', { terminal: tab.processedByTerminal ?? '?' }) }}
        </Message>
        <Message v-if="tab.status === 'INVOICED'" class="mt-4" :icon="undefined" severity="info">
          {{ t('modules.financial.tab.detail.invoicedHint') }}
        </Message>

        <template #footer>
          <!-- Actions on the left, Edit on its own on the right. -->
          <div class="flex flex-wrap items-center gap-2">
            <div class="flex flex-wrap gap-2">
              <Button
                v-if="tab.status === 'OPEN' && canUpdate && tab.outstanding.amount > 0 && canConvert"
                :disabled="busy"
                icon="pi pi-file"
                :label="t('modules.financial.tab.convert.action')"
                outlined
                @click="confirmConvert"
              />
              <Button
                v-if="tab.status === 'OPEN' && tab.outstanding.amount === 0 && canDelete"
                :disabled="busy"
                icon="pi pi-times"
                :label="t('modules.financial.tab.detail.cancelTab')"
                outlined
                severity="danger"
                @click="confirmCancelTab"
              />
              <Button
                v-if="tab.status === 'LOCKED' && canPay"
                :disabled="busy"
                icon="pi pi-times"
                :label="t('modules.financial.tab.detail.cancelPayment')"
                outlined
                severity="danger"
                @click="confirmCancelPayment"
              />
              <template v-if="tab.status === 'PAID'">
                <Button
                  :disabled="busy"
                  icon="pi pi-file-export"
                  :label="t('common.downloadPdf')"
                  outlined
                  @click="downloadReceipt"
                />
                <Button
                  v-if="canUpdate"
                  :disabled="busy"
                  icon="pi pi-envelope"
                  :label="t('modules.financial.tab.detail.resendReceipt')"
                  outlined
                  @click="resendReceipt"
                />
              </template>
            </div>
            <Button
              v-if="tab.status === 'OPEN' && canUpdate"
              class="ml-auto"
              icon="pi pi-pencil"
              :label="t('common.edit')"
              outlined
              @click="openEdit"
            />
          </div>
        </template>
      </CardComponent>

      <!-- The tab account is hidden from the user list, so its transactions are shown here. -->
      <CardComponent v-if="canViewMutations" class="w-full" :header="t('components.mutations.balance')">
        <MutationsBalance ref="mutations" :get-mutations="getMutations" paginator />
      </CardComponent>

      <Dialog
        v-model:visible="showEdit"
        class="w-[30rem]"
        :draggable="false"
        :header="t('modules.financial.tab.edit.header')"
        modal
      >
        <form id="tab-edit-form" class="flex flex-col gap-3" @submit.prevent="saveEdit">
          <label class="flex flex-col gap-1">
            <span>{{ t('common.name') }}</span>
            <InputText v-model="edit.name" maxlength="64" />
          </label>
          <label class="flex flex-col gap-1">
            <span>{{ t('modules.financial.tab.contactName') }}</span>
            <InputText v-model="edit.contactName" maxlength="64" />
          </label>
          <label class="flex flex-col gap-1">
            <span>{{ t('common.email') }}</span>
            <InputText v-model="edit.contactEmail" maxlength="64" type="email" />
          </label>
        </form>
        <template #footer>
          <Button :label="t('common.cancel')" outlined @click="showEdit = false" />
          <Button :disabled="busy || !editValid" form="tab-edit-form" :label="t('common.save')" type="submit" />
        </template>
      </Dialog>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'openvue/usetoast';
import { useConfirm } from 'openvue/useconfirm';
import { isAxiosError } from 'axios';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import type { PaginatedFinancialMutationResponse, TabResponse } from '@gewis/sudosos-client';
import PageContainer from '@/layout/PageContainer.vue';
import CardComponent from '@/components/CardComponent.vue';
import MutationsBalance from '@/components/mutations/MutationsBalance.vue';
import apiService from '@/services/ApiService';
import { useTabStore } from '@/stores/tab.store';
import { formatDateAndTime, formatDineroObject } from '@/utils/formatterUtils';
import { getTabReceiptPdfSrc } from '@/utils/urlUtils';
import { handleError } from '@/utils/errorUtils';
import { TAB_STATUS_SEVERITY } from '@/modules/financial/utils/tabStatus';

const props = defineProps<{
  id: string;
}>();

const { t } = useI18n();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const tabStore = useTabStore();

const tab = ref<TabResponse | null>(null);
const busy = ref(false);
const settledAt = computed(() => tab.value?.paidAt ?? tab.value?.invoicedAt ?? tab.value?.cancelledAt);

// The tab endpoints require all attributes (`*`), so check the same here.
const canUpdate = computed(() => isAllowed('update', ['all'], 'Tab', ['*']));
const canDelete = computed(() => isAllowed('delete', ['all'], 'Tab', ['*']));
const canPay = computed(() => isAllowed('pay', ['all'], 'Tab', ['*']));
const canConvert = computed(() => isAllowed('create', ['all'], 'Invoice', ['*']));
// Same permissions as GET /users/:id/financialmutations.
const canViewMutations = computed(
  () => isAllowed('get', ['all'], 'Transaction', ['*']) && isAllowed('get', ['all'], 'Transfer', ['*']),
);

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const showEdit = ref(false);
const edit = reactive({ name: '', contactName: '', contactEmail: '' });
const editValid = computed(
  () => edit.name.trim() !== '' && edit.contactName.trim() !== '' && EMAIL.test(edit.contactEmail.trim()),
);

/** Initial load of the tab in the route; unknown or invalid ids go to the error page. */
async function load() {
  tab.value = null;
  const routeId = props.id;
  const id = Number(routeId);
  if (Number.isInteger(id) && id > 0) {
    try {
      const fetched = await tabStore.fetchTab(id);
      // The route may have moved on to another tab while this one was loading.
      if (props.id === routeId) tab.value = fetched;
      return;
    } catch (err) {
      if (!isAxiosError(err)) throw err;
      if (props.id !== routeId) return;
      handleError(err, toast);
    }
  }
  await router.replace('/error');
}

// Same lint quirk with component instance types as in AdminSingleUserView.
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
const mutations = ref<InstanceType<typeof MutationsBalance> | null>(null);

async function getMutations(take: number, skip: number): Promise<PaginatedFinancialMutationResponse | undefined> {
  if (!tab.value) return undefined;
  try {
    const res = await apiService.user.getUsersFinancialMutations({ id: tab.value.user.id, take, skip });
    return res.data;
  } catch (err) {
    if (!isAxiosError(err)) throw err;
    handleError(err, toast);
    return undefined;
  }
}

function success(detail: string) {
  toast.add({ severity: 'success', summary: t('common.toast.success.success'), detail, life: 3000 });
}

/**
 * Run an action on the tab, showing the API error if it fails.
 * Actions that change the tab return the updated tab, which replaces the shown one.
 */
async function run(action: () => Promise<TabResponse | void>, successMessage?: string) {
  busy.value = true;
  try {
    const updated = await action();
    if (updated && updated.id === tab.value?.id) {
      tab.value = updated;
      // getMutations handles its own errors, so a failed reload never undoes the success above.
      void mutations.value?.refresh();
    }
    if (successMessage) success(successMessage);
    return true;
  } catch (err) {
    if (!isAxiosError(err)) throw err;
    handleError(err, toast);
    // 409: the tab changed elsewhere (e.g. a terminal payment started), so show its current state.
    if (err.response?.status === 409) await reloadAfterConflict();
    return false;
  } finally {
    busy.value = false;
  }
}

async function reloadAfterConflict() {
  const id = tab.value?.id;
  if (!id) return;
  try {
    const fresh = await tabStore.fetchTab(id);
    if (tab.value?.id !== id) return;
    tab.value = fresh;
    // Editing only works on an open tab, so its dialog can't succeed anymore.
    if (fresh.status !== 'OPEN') showEdit.value = false;
    void mutations.value?.refresh();
  } catch {
    // The conflict was already reported; a failed reload just leaves the old state.
  }
}

function openEdit() {
  if (!tab.value) return;
  edit.name = tab.value.name;
  edit.contactName = tab.value.contactName;
  edit.contactEmail = tab.value.contactEmail;
  showEdit.value = true;
}

async function saveEdit() {
  if (!tab.value || busy.value || !editValid.value) return;
  const id = tab.value.id;
  const ok = await run(
    () =>
      tabStore.updateTab(id, {
        name: edit.name.trim(),
        contactName: edit.contactName.trim(),
        contactEmail: edit.contactEmail.trim(),
      }),
    t('modules.financial.tab.edit.success'),
  );
  if (ok) showEdit.value = false;
}

/** The address is entered when the invoice is created, so converting asks for nothing else. */
function confirmConvert() {
  if (!tab.value) return;
  const id = tab.value.id;
  confirm.require({
    group: 'tabDetail',
    header: t('modules.financial.tab.convert.confirmHeader'),
    message: t('modules.financial.tab.convert.confirm'),
    acceptLabel: t('common.confirm'),
    rejectLabel: t('common.cancel'),
    accept: () => void run(() => tabStore.convertToInvoiceAccount(id), t('modules.financial.tab.convert.success')),
  });
}

function confirmCancelTab() {
  if (!tab.value) return;
  const id = tab.value.id;
  confirm.require({
    group: 'tabDetail',
    header: t('common.areYouSure'),
    message: t('modules.financial.tab.detail.cancelTabConfirm'),
    acceptLabel: t('modules.financial.tab.detail.cancelTab'),
    rejectLabel: t('common.cancel'),
    accept: () => void run(() => tabStore.cancelTab(id), t('modules.financial.tab.detail.cancelTabSuccess')),
  });
}

function confirmCancelPayment() {
  if (!tab.value) return;
  const id = tab.value.id;
  confirm.require({
    group: 'tabDetail',
    header: t('common.areYouSure'),
    message: t('modules.financial.tab.detail.cancelPaymentConfirm'),
    acceptLabel: t('modules.financial.tab.detail.cancelPayment'),
    rejectLabel: t('common.cancel'),
    accept: () => void run(() => tabStore.cancelPayment(id), t('modules.financial.tab.detail.cancelPaymentSuccess')),
  });
}

async function downloadReceipt() {
  if (!tab.value) return;
  const id = tab.value.id;
  await run(async () => {
    const pdf = await tabStore.fetchReceipt(id);
    if (pdf) window.location.href = getTabReceiptPdfSrc(pdf);
  });
}

async function resendReceipt() {
  if (!tab.value) return;
  const { id, contactEmail } = tab.value;
  await run(() => tabStore.sendReceipt(id), t('modules.financial.tab.detail.resendSuccess', { email: contactEmail }));
}

watchEffect(() => {
  if (tab.value) {
    document.title = `${tab.value.name} #${tab.value.id} - ${t('common.titles.tabs')} | ${t('common.sudosos')}`;
  }
});

watch(() => props.id, load, { immediate: true });
</script>
