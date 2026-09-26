<template>
  <Dialog
    v-model:visible="visible"
    class="w-full max-w-[70rem]"
    :draggable="false"
    :header="t('modules.financial.debtor.fineRound.title')"
    modal
    @show="reset"
  >
    <Stepper v-model:value="step" linear>
      <StepList>
        <Step :value="1">{{ t('modules.financial.debtor.fineRound.steps.dates') }}</Step>
        <Step :value="2">{{ t('modules.financial.debtor.fineRound.steps.fines') }}</Step>
        <Step :value="3">{{ t('modules.financial.debtor.fineRound.steps.warnings') }}</Step>
        <Step :value="4">{{ t('modules.financial.debtor.fineRound.steps.confirm') }}</Step>
      </StepList>
      <StepPanels>
        <StepPanel :value="1">
          <p class="mb-4">{{ t('modules.financial.debtor.fineRound.explanation') }}</p>
          <div class="flex flex-col gap-4 sm:flex-row">
            <div class="flex flex-col gap-1">
              <label for="measurementDate">{{ t('modules.financial.debtor.fineRound.measurementDate') }}</label>
              <DatePicker
                v-model="measurementDate"
                hour-format="24"
                input-id="measurementDate"
                :max-date="new Date()"
                show-time
              />
            </div>
            <div class="flex flex-col gap-1">
              <label for="previousMeasurementDate">
                {{ t('modules.financial.debtor.fineRound.previousMeasurementDate') }}
              </label>
              <DatePicker
                v-model="previousMeasurementDate"
                hour-format="24"
                input-id="previousMeasurementDate"
                :max-date="measurementDate"
                show-time
              />
            </div>
          </div>
          <Message v-if="datesInvalid" class="mt-4" severity="warn">
            {{ t('modules.financial.debtor.fineRound.invalidDates') }}
          </Message>
          <div class="flex justify-end mt-6">
            <Button
              :disabled="datesInvalid"
              icon="pi pi-arrow-right"
              icon-pos="right"
              :label="t('modules.financial.debtor.fineRound.next')"
              :loading="isCalculating"
              @click="calculate"
            />
          </div>
        </StepPanel>

        <StepPanel :value="2">
          <Message class="mb-4" severity="info">{{ t('modules.financial.debtor.fineRound.finesInfo') }}</Message>
          <DataTable
            v-model:selection="selectedFines"
            data-key="id"
            scroll-height="40vh"
            scrollable
            striped-rows
            :value="fineRows"
          >
            <Column selection-mode="multiple" style="width: 3rem" />
            <Column field="gewisId" :header="t('common.gewisId')" />
            <Column field="name" :header="t('common.name')">
              <template #body="{ data }">
                <UserLink new-tab :user="data.user" />
              </template>
            </Column>
            <Column field="balance" :header="balanceOn(measurementDate)" />
            <Column field="previousBalance" :header="balanceOn(previousMeasurementDate)" />
            <Column class="font-bold" field="fine" :header="t('modules.financial.debtor.debtorUsers.toBeFined')" />
          </DataTable>
          <p class="mt-2 text-sm">{{ t('modules.financial.debtor.fineRound.deselectedNote') }}</p>
          <p class="font-bold mt-2">
            {{
              t('modules.financial.debtor.fineRound.selectedFines', {
                count: selectedFines.length,
                amount: formatPrice(sumOf(selectedFines, 'fineAmount')),
              })
            }}
          </p>
          <div class="flex justify-between mt-6">
            <Button icon="pi pi-arrow-left" :label="t('common.back')" outlined @click="step = 1" />
            <Button
              icon="pi pi-arrow-right"
              icon-pos="right"
              :label="t('modules.financial.debtor.fineRound.next')"
              @click="step = 3"
            />
          </div>
        </StepPanel>

        <StepPanel :value="3">
          <Message class="mb-4" severity="info">{{ t('modules.financial.debtor.fineRound.warningsInfo') }}</Message>
          <DataTable
            v-model:selection="selectedWarnings"
            data-key="id"
            scroll-height="40vh"
            scrollable
            striped-rows
            :value="warningRows"
          >
            <Column selection-mode="multiple" style="width: 3rem" />
            <Column field="gewisId" :header="t('common.gewisId')" />
            <Column field="name" :header="t('common.name')">
              <template #body="{ data }">
                <UserLink new-tab :user="data.user" />
              </template>
            </Column>
            <Column field="balance" :header="balanceOn(measurementDate)" />
            <Column field="fine" :header="t('modules.financial.debtor.fineRound.futureFine')" />
          </DataTable>
          <p class="font-bold mt-2">
            {{
              t('modules.financial.debtor.fineRound.selectedWarnings', {
                count: selectedWarnings.length,
                amount: formatPrice(sumOf(selectedWarnings, 'balanceAmount')),
              })
            }}
          </p>
          <div class="flex justify-between mt-6">
            <Button icon="pi pi-arrow-left" :label="t('common.back')" outlined @click="step = 2" />
            <Button
              icon="pi pi-arrow-right"
              icon-pos="right"
              :label="t('modules.financial.debtor.fineRound.next')"
              @click="step = 4"
            />
          </div>
        </StepPanel>

        <StepPanel :value="4">
          <p class="mb-4">
            {{
              t('modules.financial.debtor.fineRound.summary', {
                fined: selectedFines.length,
                amount: formatPrice(sumOf(selectedFines, 'fineAmount')),
                warned: selectedWarnings.length,
                date: formatDateTime(measurementDate),
              })
            }}
          </p>
          <ul class="flex flex-col gap-2">
            <li class="flex gap-2 items-center">
              <i :class="statusIcon(handoutStatus)" />
              {{ t('modules.financial.debtor.fineRound.handoutStep', { count: selectedFines.length }) }}
            </li>
            <li class="flex gap-2 items-center">
              <i :class="statusIcon(notifyStatus)" />
              {{ t('modules.financial.debtor.fineRound.notifyStep', { count: selectedWarnings.length }) }}
            </li>
          </ul>
          <div class="flex justify-between mt-6">
            <Button
              :disabled="isRunning || isDone || handoutStatus === 'done'"
              icon="pi pi-arrow-left"
              :label="t('common.back')"
              outlined
              @click="step = 3"
            />
            <Button v-if="isDone" icon="pi pi-check" :label="t('common.close')" @click="visible = false" />
            <Button
              v-else
              :disabled="selectedFines.length === 0 && selectedWarnings.length === 0"
              icon="pi pi-play"
              :label="t('modules.financial.debtor.fineRound.run')"
              :loading="isRunning"
              @click="run"
            />
          </div>
        </StepPanel>
      </StepPanels>
    </Stepper>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import type { UserResponse, UserToFineResponse } from '@gewis/sudosos-client';
import ApiService from '@/services/ApiService';
import { useDebtorStore } from '@/stores/debtor.store';
import { formatDateTime, formatPrice } from '@/utils/formatterUtils';
import { handleError } from '@/utils/errorUtils';
import UserLink from '@/components/UserLink.vue';

const visible = defineModel<boolean>('visible', { required: true });
const emit = defineEmits<{ completed: [] }>();

const { t } = useI18n();
const toast = useToast();
const debtorStore = useDebtorStore();

// Only these user types can be fined; mirrors debtorStore.fetchCalculatedFines
const FINEABLE_USER_TYPES = ['MEMBER', 'LOCAL_USER'];

type StepStatus = 'pending' | 'running' | 'done' | 'skipped' | 'failed';

interface FineRoundRow {
  id: number;
  user: UserResponse;
  gewisId?: number;
  name: string;
  balance: string;
  balanceAmount: number;
  previousBalance?: string;
  fine: string;
  fineAmount: number;
}

const step = ref(1);
const measurementDate = ref<Date>(new Date());
const previousMeasurementDate = ref<Date>();

const isCalculating = ref(false);
const fineRows = ref<FineRoundRow[]>([]);
const warningRows = ref<FineRoundRow[]>([]);
const selectedFines = ref<FineRoundRow[]>([]);
const selectedWarnings = ref<FineRoundRow[]>([]);

const handoutStatus = ref<StepStatus>('pending');
const notifyStatus = ref<StepStatus>('pending');
const isRunning = computed(() => handoutStatus.value === 'running' || notifyStatus.value === 'running');
const isDone = computed(() => notifyStatus.value === 'done' || notifyStatus.value === 'skipped');

const datesInvalid = computed(
  () =>
    !measurementDate.value || !previousMeasurementDate.value || previousMeasurementDate.value >= measurementDate.value,
);

async function reset() {
  step.value = 1;
  measurementDate.value = new Date();
  previousMeasurementDate.value = undefined;
  fineRows.value = [];
  warningRows.value = [];
  selectedFines.value = [];
  selectedWarnings.value = [];
  handoutStatus.value = 'pending';
  notifyStatus.value = 'pending';

  // Default the previous measurement to the reference date of the last handout
  const events = await ApiService.debtor.returnAllFineHandoutEvents({ take: 1, skip: 0 });
  const last = events.data.records[0];
  if (last) previousMeasurementDate.value = new Date(last.referenceDate);
}

function balanceOn(date?: Date) {
  if (!date) return '';
  return t('modules.financial.debtor.debtorUsers.balanceOn', { date: formatDateTime(date) });
}

function sumOf(rows: FineRoundRow[], field: 'fineAmount' | 'balanceAmount') {
  return {
    amount: rows.reduce((sum, r) => sum + r[field], 0),
    currency: 'EUR',
    precision: 2,
  };
}

function toRow(fine: UserToFineResponse, user: UserResponse): FineRoundRow {
  return {
    id: fine.id,
    user,
    gewisId: user.gewisId,
    name: `${user.firstName} ${user.lastName}`,
    balance: formatPrice(fine.balances[0].amount),
    balanceAmount: fine.balances[0].amount.amount,
    previousBalance: fine.balances[1] && formatPrice(fine.balances[1].amount),
    fine: formatPrice(fine.fineAmount),
    fineAmount: fine.fineAmount.amount,
  };
}

/**
 * Split the debtors into users to fine (in debt on both measurement dates) and users to only warn
 * (in debt on the measurement date only). See GEWIS/sudosos#91.
 */
async function calculate() {
  if (datesInvalid.value) return;
  isCalculating.value = true;
  try {
    const measurement = measurementDate.value.toISOString();
    const previous = previousMeasurementDate.value!.toISOString();
    const [inDebt, toFine] = await Promise.all([
      ApiService.debtor.calculateFines({ referenceDates: [measurement], userTypes: FINEABLE_USER_TYPES }),
      ApiService.debtor.calculateFines({ referenceDates: [measurement, previous], userTypes: FINEABLE_USER_TYPES }),
    ]);

    const fineIds = new Set(toFine.data.map((f) => f.id));
    const toWarn = inDebt.data.filter((f) => !fineIds.has(f.id));

    const users = await Promise.all(
      inDebt.data.map((f) => ApiService.user.getIndividualUser({ id: f.id }).then((r) => r.data)),
    );
    const userById = new Map(users.map((u) => [u.id, u]));

    fineRows.value = toFine.data.filter((f) => userById.has(f.id)).map((f) => toRow(f, userById.get(f.id)!));
    warningRows.value = toWarn.map((f) => toRow(f, userById.get(f.id)!));
    selectedFines.value = [...fineRows.value];
    selectedWarnings.value = [...warningRows.value];
    step.value = 2;
  } catch (err) {
    handleError(err as AxiosError, toast);
  } finally {
    isCalculating.value = false;
  }
}

async function run() {
  // Fines first: if the handout fails, nobody should get a warning instead of their fine.
  if (handoutStatus.value !== 'done') {
    if (selectedFines.value.length === 0) {
      handoutStatus.value = 'skipped';
    } else {
      handoutStatus.value = 'running';
      try {
        await debtorStore.handoutFines(
          selectedFines.value.map((r) => r.id),
          measurementDate.value,
        );
        handoutStatus.value = 'done';
      } catch (err) {
        handoutStatus.value = 'failed';
        handleError(err as AxiosError, toast);
        return;
      }
    }
  }

  if (selectedWarnings.value.length === 0) {
    notifyStatus.value = 'skipped';
  } else {
    notifyStatus.value = 'running';
    try {
      await debtorStore.notifyFines(
        selectedWarnings.value.map((r) => r.id),
        measurementDate.value,
      );
      notifyStatus.value = 'done';
    } catch (err) {
      notifyStatus.value = 'failed';
      handleError(err as AxiosError, toast);
      return;
    }
  }

  toast.add({
    summary: t('common.toast.success.success'),
    detail: t('common.toast.success.fineRoundCompleted'),
    life: 3000,
    severity: 'success',
  });
  emit('completed');
}

function statusIcon(status: StepStatus) {
  switch (status) {
    case 'running':
      return 'pi pi-spin pi-spinner';
    case 'done':
      return 'pi pi-check-circle text-green-500';
    case 'skipped':
      return 'pi pi-minus-circle text-gray-400';
    case 'failed':
      return 'pi pi-times-circle text-red-500';
    default:
      return 'pi pi-circle';
  }
}
</script>
