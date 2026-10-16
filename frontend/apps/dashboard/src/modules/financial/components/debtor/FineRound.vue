<template>
  <CardComponent class="w-full" :header="t('modules.financial.debtor.fineRound.title')">
    <Stepper v-model:value="step" linear>
      <StepList>
        <Step :value="STEP.DATES">{{ t('modules.financial.debtor.fineRound.steps.dates') }}</Step>
        <Step :value="STEP.FINES">{{ t('modules.financial.debtor.fineRound.steps.fines') }}</Step>
        <Step :value="STEP.WARNINGS">{{ t('modules.financial.debtor.fineRound.steps.warnings') }}</Step>
        <Step :value="STEP.CONFIRM">{{ t('modules.financial.debtor.fineRound.steps.confirm') }}</Step>
      </StepList>
      <!-- Fixed height so the navigation below does not jump around between steps -->
      <StepPanels class="min-h-[36rem]">
        <StepPanel :value="STEP.DATES">
          <FineRoundDatesStep
            v-model:measurement-date="measurementDate"
            v-model:previous-measurement-date="previousMeasurementDate"
            :dates-valid="datesValid"
          />
        </StepPanel>
        <StepPanel :value="STEP.FINES">
          <FineRoundSelectStep
            v-model:selection="selectedFines"
            :balance-dates="finesBalanceDates"
            :debtors="finesToHandOut"
            :fine-header="t('modules.financial.debtor.debtorUsers.toBeFined')"
            :info="t('modules.financial.debtor.fineRound.finesInfo')"
            :note="t('modules.financial.debtor.fineRound.deselectedNote')"
            :summary="
              t(
                'modules.financial.debtor.fineRound.selectedFines',
                { count: selectedFines.length, amount: formatPrice(selectedFineTotal) },
                selectedFines.length,
              )
            "
          />
        </StepPanel>
        <StepPanel :value="STEP.WARNINGS">
          <FineRoundSelectStep
            v-model:selection="selectedWarnings"
            :balance-dates="[measurementDate]"
            :debtors="usersToWarn"
            :fine-header="t('modules.financial.debtor.fineRound.futureFine')"
            :info="t('modules.financial.debtor.fineRound.warningsInfo')"
            :summary="
              t(
                'modules.financial.debtor.fineRound.selectedWarnings',
                { count: selectedWarnings.length, amount: formatPrice(selectedWarningDebtTotal) },
                selectedWarnings.length,
              )
            "
          />
        </StepPanel>
        <StepPanel :value="STEP.CONFIRM">
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
          :icon="step === STEP.DATES ? 'pi pi-times' : 'pi pi-arrow-left'"
          :label="step === STEP.DATES ? t('common.cancel') : t('common.back')"
          outlined
          @click="back"
        />
        <Button
          v-if="step === STEP.CONFIRM"
          :disabled="selectedFines.length === 0 && selectedWarnings.length === 0"
          icon="pi pi-play"
          :label="t('modules.financial.debtor.fineRound.run')"
          :loading="isRunning"
          @click="executeFineRound"
        />
        <Button
          v-else
          :disabled="step === STEP.DATES && !datesValid"
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
import { useToast } from 'openvue/usetoast';
import type { AxiosError } from 'axios';
import type { DineroObjectResponse, UserToFineResponse } from '@gewis/sudosos-client';
import ApiService from '@/services/ApiService';
import { FINEABLE_USER_TYPES, useDebtorStore } from '@/stores/debtor.store';
import { formatPrice, toDineroResponse } from '@/utils/formatterUtils';
import { handleError } from '@/utils/errorUtils';
import CardComponent from '@/components/CardComponent.vue';
import FineRoundConfirmStep from '@/modules/financial/components/debtor/fineRound/FineRoundConfirmStep.vue';
import FineRoundDatesStep from '@/modules/financial/components/debtor/fineRound/FineRoundDatesStep.vue';
import FineRoundSelectStep from '@/modules/financial/components/debtor/fineRound/FineRoundSelectStep.vue';

const emit = defineEmits<{ completed: []; cancel: [] }>();

const { t } = useI18n();
const toast = useToast();
const debtorStore = useDebtorStore();

const STEP = { DATES: 1, FINES: 2, WARNINGS: 3, CONFIRM: 4 } as const;
const step = ref<number>(STEP.DATES);
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

// All step panels render right away, before the previous date has loaded (or when there is none yet)
const finesBalanceDates = computed(() =>
  previousMeasurementDate.value ? [measurementDate.value, previousMeasurementDate.value] : [measurementDate.value],
);

const selectedFineTotal = computed(() => sumAmounts(selectedFines.value.map((f) => f.fineAmount)));
const selectedWarningDebtTotal = computed(() => sumAmounts(selectedWarnings.value.map((f) => f.balances[0].amount)));

// Prefill the previous measurement date with the last handout
onMounted(async () => {
  try {
    previousMeasurementDate.value = await debtorStore.fetchLastHandoutDate();
  } catch (err) {
    handleError(err as AxiosError, toast);
  }
});

function sumAmounts(amounts: DineroObjectResponse[]) {
  return toDineroResponse(amounts.reduce((sum, a) => sum + a.amount, 0));
}

function back() {
  if (step.value === STEP.DATES) emit('cancel');
  else step.value--;
}

function next() {
  if (step.value === STEP.DATES) void loadCandidates();
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
    step.value = STEP.FINES;
  } catch (err) {
    handleError(err as AxiosError, toast);
  } finally {
    isLoadingCandidates.value = false;
  }
}

/**
 * Hand out the selected fines, then send the selected warnings. Stops at the first failure, so nobody
 * gets a warning instead of their fine. The handout also runs without fines, so the next round uses this
 * measurement date as its previous one.
 */
async function executeFineRound() {
  try {
    if (!finesHandedOut.value) {
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
