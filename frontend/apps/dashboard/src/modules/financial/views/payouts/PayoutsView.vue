<template>
  <div class="page-container">
    <div class="page-title">{{ t('modules.financial.payout.title') }}</div>
    <div class="content-wrapper flex flex-col">
      <div class="flex flex-row justify-end w-full">
        <Button
          icon="pi pi-plus"
          :label="t('modules.financial.payout.create')"
          severity="primary"
          type="button"
          @click="showDialog = true"
        />
      </div>
      <TabView class="w-full">
        <TabPanel v-for="state in states" :key="state" :header="state">
          <PayoutTable :state="state" />
        </TabPanel>
      </TabView>
    </div>
    <FormDialog v-model="showDialog" :form="form" :header="t('modules.financial.payout.create')" :is-editable="true">
      <template #form="slotProps">
        <PayoutCreateForm :form="slotProps.form" @submit:success="showDialog = false" />
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { PayoutRequestStatusRequestStateEnum } from '@sudosos/sudosos-client';
import { type Ref, ref } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
import PayoutTable from '@/modules/financial/components/payout/PayoutTable.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createPayoutSchema } from '@/utils/validation-schema';
import FormDialog from '@/components/FormDialog.vue';
import PayoutCreateForm from '@/modules/financial/components/payout/forms/PayoutCreateForm.vue';

const { t } = useI18n();

const states = [
  PayoutRequestStatusRequestStateEnum.Created,
  PayoutRequestStatusRequestStateEnum.Approved,
  PayoutRequestStatusRequestStateEnum.Denied,
  PayoutRequestStatusRequestStateEnum.Cancelled,
];

const showDialog: Ref<boolean> = ref(false);
const form = schemaToForm(createPayoutSchema);
</script>

<style scoped lang="scss"></style>
