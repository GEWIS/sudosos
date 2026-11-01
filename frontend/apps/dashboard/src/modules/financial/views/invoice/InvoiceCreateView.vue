<template>
  <PageContainer class="flex-1 flex flex-col">
    <CardComponent class="invoice-create flex-1" :header="t('modules.financial.invoice.create.create')">
      <Stepper v-model:value="step" class="flex flex-col flex-1" linear>
        <StepList>
          <Step :value="STEP.ACCOUNT">{{ t('modules.financial.invoice.create.steps.account') }}</Step>
          <Step :value="STEP.DETAILS">{{ t('modules.financial.invoice.create.steps.details') }}</Step>
          <Step :value="STEP.SUMMARY">{{ t('modules.financial.invoice.create.steps.summary') }}</Step>
        </StepList>
        <!-- Inactive panels are hidden with v-show, so the calendar selection survives going back. -->
        <!-- At least as tall as the tallest step (the summary), so the buttons also stay put when the window is short. -->
        <StepPanels class="flex-1 min-h-[41rem]">
          <StepPanel :value="STEP.ACCOUNT">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex flex-col gap-6">
                <InvoiceCreateUserCard :form="form" />
                <InvoiceTransactionsCard :form="form" />
              </div>
              <!-- On wide screens the lines card takes the left column's height and scrolls inside,
                 so a long invoice does not make the page longer. -->
              <div class="relative">
                <InvoiceCreateEntriesCard class="md:absolute md:inset-0" :form="form" />
              </div>
            </div>
          </StepPanel>
          <StepPanel :value="STEP.DETAILS">
            <InvoiceCreateDetailsCard :form="form" />
          </StepPanel>
          <StepPanel :value="STEP.SUMMARY">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <InvoiceCreateDetailsCard disabled :form="form" />
              <div class="relative">
                <InvoiceCreateEntriesCard class="md:absolute md:inset-0" :form="form" />
              </div>
            </div>
          </StepPanel>
        </StepPanels>
        <div class="flex justify-between mt-6">
          <Button
            :icon="step === STEP.ACCOUNT ? 'pi pi-times' : 'pi pi-arrow-left'"
            :label="step === STEP.ACCOUNT ? t('common.cancel') : t('common.back')"
            outlined
            @click="back"
          />
          <InvoiceCreate v-if="step === STEP.SUMMARY" :form="form" />
          <Button
            v-else
            :disabled="!canContinue"
            icon="pi pi-arrow-right"
            icon-pos="right"
            :label="t('modules.financial.invoice.create.next')"
            @click="next"
          />
        </div>
      </Stepper>
    </CardComponent>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import CardComponent from '@/components/CardComponent.vue';
import InvoiceTransactionsCard from '@/modules/financial/components/invoice/create/InvoiceTransactionsCard.vue';
import { getProperty, schemaToForm } from '@/utils/formUtils';
import { createInvoiceObject } from '@/utils/validation-schema';
import InvoiceCreateUserCard from '@/modules/financial/components/invoice/create/InvoiceCreateUserCard.vue';
import InvoiceCreateDetailsCard from '@/modules/financial/components/invoice/create/InvoiceCreateDetailsCard.vue';
import InvoiceCreateEntriesCard from '@/modules/financial/components/invoice/create/InvoiceCreateEntriesCard.vue';
import InvoiceCreate from '@/modules/financial/components/invoice/create/InvoiceCreate.vue';
import PageContainer from '@/layout/PageContainer.vue';

const { t } = useI18n();
const router = useRouter();

const STEP = { ACCOUNT: 1, DETAILS: 2, SUMMARY: 3 } as const;
const step = ref<number>(STEP.ACCOUNT);

const form = schemaToForm(createInvoiceObject);

const canContinue = computed(() => {
  if (step.value !== STEP.ACCOUNT) return true;
  return getProperty(form, 'forId') !== undefined && (getProperty(form, 'transactionIDs')?.length ?? 0) > 0;
});

function back() {
  if (step.value === STEP.ACCOUNT) void router.push({ name: 'invoices' });
  else step.value -= 1;
}

async function next() {
  if (step.value === STEP.DETAILS) {
    const { valid } = await form.context.validate();
    if (!valid) return;
  }
  step.value += 1;
}
</script>

<style scoped lang="scss">
// Pass the card's height down to the stepper, so every step fills the card.
.invoice-create {
  display: flex;
  flex-direction: column;
}

.invoice-create > :deep(.p-card-body) {
  flex: 1;
}

.invoice-create > :deep(.p-card-body > .p-card-content) {
  display: flex;
  flex-direction: column;
}

// Inside this card the step cards render flat, so there is no card inside a card.
.invoice-create :deep(.p-card) {
  background: transparent;
  box-shadow: none;
  border-radius: 0;
}

.invoice-create :deep(.p-card > .p-card-header > div) {
  padding: 0;
}

.invoice-create :deep(.p-card > .p-card-body) {
  padding: 0.75rem 0 0;
}
</style>
