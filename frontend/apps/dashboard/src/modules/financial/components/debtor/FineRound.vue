<template>
  <CardComponent class="w-full" :header="t('modules.financial.debtor.fineRound.title')">
    <div v-if="!started" class="flex flex-col items-center text-center">
      <Message v-if="!previousMeasurementDate && !isLoadingOverview" severity="info">
        {{ t('modules.financial.debtor.fineRound.overviewNoPrevious') }}
      </Message>
      <template v-else>
        <p class="mb-6">
          {{
            t('modules.financial.debtor.fineRound.overviewIntro', {
              date: formatDateTime(measurementDate),
              previousDate: previousMeasurementDate ? formatDateTime(previousMeasurementDate) : '',
            })
          }}
        </p>
        <div class="flex flex-wrap gap-12 justify-center">
          <div v-for="stat in overviewStats" :key="stat.label" class="flex flex-col gap-1 items-center">
            <Skeleton v-if="isLoadingOverview" height="2.5rem" width="6rem" />
            <span v-else class="font-bold text-4xl">{{ stat.value }}</span>
            <span>{{ stat.label }}</span>
          </div>
        </div>
      </template>
      <Button
        v-if="canHandout"
        class="mt-6"
        icon="pi pi-play"
        :label="t('modules.financial.debtor.fineRound.start')"
        @click="started = true"
      />
    </div>

    <Stepper v-else v-model:value="step" linear>
      <StepList>
        <Step :value="1">{{ t('modules.financial.debtor.fineRound.steps.dates') }}</Step>
        <Step :value="2">{{ t('modules.financial.debtor.fineRound.steps.fines') }}</Step>
        <Step :value="3">{{ t('modules.financial.debtor.fineRound.steps.warnings') }}</Step>
        <Step :value="4">{{ t('modules.financial.debtor.fineRound.steps.confirm') }}</Step>
      </StepList>
      <!-- Fixed height so the navigation below does not jump around between steps -->
      <StepPanels class="min-h-[36rem]">
        <StepPanel :value="1">
          <FineRoundDatesStep
            v-model:measurement-date="measurementDate"
            v-model:previous-measurement-date="previousMeasurementDate"
            :dates-valid="datesValid"
          />
        </StepPanel>
        <StepPanel :value="2">
          <FineRoundSelectStep
            v-model:selection="selectedFines"
            :balance-dates="[measurementDate, previousMeasurementDate!]"
            :debtors="finesToHandOut"
            :fine-header="t('modules.financial.debtor.debtorUsers.toBeFined')"
            :info="t('modules.financial.debtor.fineRound.finesInfo')"
            :note="t('modules.financial.debtor.fineRound.deselectedNote')"
            :summary="
              t('modules.financial.debtor.fineRound.selectedFines', {
                count: selectedFines.length,
                amount: formatPrice(selectedFineTotal),
              })
            "
          />
        </StepPanel>
        <StepPanel :value="3">
          <FineRoundSelectStep
            v-model:selection="selectedWarnings"
            :balance-dates="[measurementDate]"
            :debtors="usersToWarn"
            :fine-header="t('modules.financial.debtor.fineRound.futureFine')"
            :info="t('modules.financial.debtor.fineRound.warningsInfo')"
            :summary="
              t('modules.financial.debtor.fineRound.selectedWarnings', {
                count: selectedWarnings.length,
                amount: formatPrice(selectedWarningDebtTotal),
              })
            "
          />
        </StepPanel>
        <StepPanel :value="4">
          <FineRoundConfirmStep
            :fines="selectedFines"
            :measurement-date="measurementDate"
            :warnings="selectedWarnings"
          />
        </StepPanel>
      </StepPanels>
      <div class="flex justify-between mt-6">
        <Button
          :disabled="isRunning || finesHandedOut"
          icon="pi pi-arrow-left"
          :label="t('common.back')"
          outlined
          @click="back"
        />
        <Button
          v-if="step === 4"
          :disabled="selectedFines.length === 0 && selectedWarnings.length === 0"
          icon="pi pi-play"
          :label="t('modules.financial.debtor.fineRound.run')"
          :loading="isRunning"
          @click="executeFineRound"
        />
        <Button
          v-else
          :disabled="step === 1 && !datesValid"
          icon="pi pi-arrow-right"
          icon-pos="right"
          :label="t('modules.financial.debtor.fineRound.next')"
          :loading="isLoadingCandidates"
          @click="next"
        />
      </div>
    </Stepper>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { AxiosError } from 'axios';
import type { DineroObjectResponse, UserToFineResponse } from '@gewis/sudosos-client';
import { isAllowed } from '@sudosos/sudosos-frontend-common';
import ApiService from '@/services/ApiService';
import { FINEABLE_USER_TYPES, useDebtorStore } from '@/stores/debtor.store';
import { formatDateTime, formatPrice } from '@/utils/formatterUtils';
import { handleError } from '@/utils/errorUtils';
import CardComponent from '@/components/CardComponent.vue';
import FineRoundConfirmStep from '@/modules/financial/components/debtor/fineRound/FineRoundConfirmStep.vue';
import FineRoundDatesStep from '@/modules/financial/components/debtor/fineRound/FineRoundDatesStep.vue';
import FineRoundSelectStep from '@/modules/financial/components/debtor/fineRound/FineRoundSelectStep.vue';

const emit = defineEmits<{ completed: [] }>();

const { t } = useI18n();
const toast = useToast();
const debtorStore = useDebtorStore();

// Users who may only view fines see the overview, but cannot start a round
const canHandout = isAllowed('update', ['all'], 'Fine', ['any']);

const started = ref(false);
const step = ref(1);
const measurementDate = ref<Date>(new Date());
const previousMeasurementDate = ref<Date>();

const isLoadingCandidates = ref(false);
const finesToHandOut = ref<UserToFineResponse[]>([]);
const usersToWarn = ref<UserToFineResponse[]>([]);
const selectedFines = ref<UserToFineResponse[]>([]);
const selectedWarnings = ref<UserToFineResponse[]>([]);

// Set once the handout succeeded, so retrying after a failed notify does not fine everyone twice
const finesHandedOut = ref(false);
const isRunning = computed(() => debtorStore.isHandoutLoading || debtorStore.isNotifyLoading);

const datesValid = computed(
  () => !!previousMeasurementDate.value && previousMeasurementDate.value < measurementDate.value,
);

const selectedFineTotal = computed(() => sumAmounts(selectedFines.value.map((f) => f.fineAmount)));
const selectedWarningDebtTotal = computed(() => sumAmounts(selectedWarnings.value.map((f) => f.balances[0].amount)));

const isLoadingOverview = ref(true);
const overview = ref({ fined: 0, amount: sumAmounts([]), warned: 0 });
const overviewStats = computed(() => [
  { label: t('modules.financial.debtor.fineRound.overviewFined'), value: overview.value.fined },
  { label: t('modules.financial.debtor.fineRound.overviewAmount'), value: formatPrice(overview.value.amount) },
  { label: t('modules.financial.debtor.fineRound.overviewWarned'), value: overview.value.warned },
]);

// Preload what a round from the last handout until now would do, for the stats shown before starting
onMounted(async () => {
  try {
    previousMeasurementDate.value = await debtorStore.fetchLastHandoutDate();
    if (!previousMeasurementDate.value) return;

    const { toFine, toWarn } = await fetchCandidates(measurementDate.value, previousMeasurementDate.value);
    overview.value = {
      fined: toFine.length,
      amount: sumAmounts(toFine.map((f) => f.fineAmount)),
      warned: toWarn.length,
    };
  } catch (err) {
    handleError(err as AxiosError, toast);
  } finally {
    isLoadingOverview.value = false;
  }
});

function sumAmounts(amounts: DineroObjectResponse[]) {
  return { amount: amounts.reduce((sum, a) => sum + a.amount, 0), currency: 'EUR', precision: 2 };
}

function back() {
  if (step.value === 1) started.value = false;
  else step.value--;
}

function next() {
  if (step.value === 1) void loadCandidates();
  else step.value++;
}

/**
 * Split the debtors into users to fine (in debt on both measurement dates) and users to only warn
 * (in debt on the measurement date only). See GEWIS/sudosos#91.
 */
async function fetchCandidates(measurementDate: Date, previousMeasurementDate: Date) {
  const measurement = measurementDate.toISOString();
  const previous = previousMeasurementDate.toISOString();
  const [inDebtNow, inDebtOnBoth] = await Promise.all([
    ApiService.debtor.calculateFines({ referenceDates: [measurement], userTypes: FINEABLE_USER_TYPES }),
    ApiService.debtor.calculateFines({ referenceDates: [measurement, previous], userTypes: FINEABLE_USER_TYPES }),
  ]);

  // The backend only returns users in debt on all given dates, so the warn-only users are the difference
  const finedIds = new Set(inDebtOnBoth.data.map((f) => f.id));
  return {
    toFine: inDebtOnBoth.data,
    toWarn: inDebtNow.data.filter((f) => !finedIds.has(f.id)),
  };
}

/**
 * Fetch the users to fine and to warn for the chosen dates, select all of them, and go to the fines step
 */
async function loadCandidates() {
  if (!datesValid.value) return;
  isLoadingCandidates.value = true;
  try {
    const { toFine, toWarn } = await fetchCandidates(measurementDate.value, previousMeasurementDate.value!);
    finesToHandOut.value = toFine;
    usersToWarn.value = toWarn;
    selectedFines.value = [...toFine];
    selectedWarnings.value = [...toWarn];
    step.value = 2;
  } catch (err) {
    handleError(err as AxiosError, toast);
  } finally {
    isLoadingCandidates.value = false;
  }
}

/**
 * Hand out the selected fines, then send the selected warnings. Stops at the first failure, so nobody
 * gets a warning instead of their fine.
 */
async function executeFineRound() {
  try {
    if (!finesHandedOut.value && selectedFines.value.length > 0) {
      await debtorStore.handoutFines(
        selectedFines.value.map((f) => f.id),
        measurementDate.value,
      );
      finesHandedOut.value = true;
    }
    if (selectedWarnings.value.length > 0) {
      await debtorStore.notifyFines(
        selectedWarnings.value.map((f) => f.id),
        measurementDate.value,
      );
    }
  } catch (err) {
    handleError(err as AxiosError, toast);
    return;
  }

  toast.add({
    summary: t('common.toast.success.success'),
    detail: t('common.toast.success.fineRoundCompleted'),
    life: 3000,
    severity: 'success',
  });
  emit('completed');
}
</script>
