<template>
  <div>
    <p class="mb-4">{{ t('modules.financial.debtor.fineRound.explanation') }}</p>
    <div class="flex flex-col gap-4 sm:flex-row">
      <div class="flex flex-col gap-1">
        <label for="measurementDate">{{ t('modules.financial.debtor.fineRound.measurementDate') }}</label>
        <DatePicker v-model="measurementDate" hour-format="24" input-id="measurementDate" :max-date="now" show-time />
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
    <Message v-if="!datesValid" class="mt-4" severity="warn">
      {{ t('modules.financial.debtor.fineRound.invalidDates') }}
    </Message>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ datesValid: boolean }>();

const measurementDate = defineModel<Date>('measurementDate', { required: true });
const previousMeasurementDate = defineModel<Date | undefined>('previousMeasurementDate');

const { t } = useI18n();
const now = new Date();
</script>
