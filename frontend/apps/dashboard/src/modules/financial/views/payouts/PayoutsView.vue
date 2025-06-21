<template>
  <PageContainer>
    <div class="flex flex-col">
      <CardComponent class="w-full" :header="t('modules.financial.payout.title')">
        <template #topAction>
          <Button
            icon="pi pi-plus"
            :label="t('modules.financial.payout.create')"
            severity="primary"
            type="button"
            @click="showDialog = true"
          />
        </template>
        <Tabs class="w-full" :value="states[0]">
          <TabList>
            <Tab v-for="state in states" :key="state" :value="state">
              {{ state }}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel v-for="state in states" :key="state" :value="state">
              <PayoutTable :state="state" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardComponent>
    </div>
    <FormDialog v-model="showDialog" :form="form" :header="t('modules.financial.payout.create')" :is-editable="true">
      <template #form="slotProps">
        <PayoutCreateForm :form="slotProps.form" @submit:success="showDialog = false" />
      </template>
    </FormDialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { PayoutRequestStatusRequestStateEnum } from '@sudosos/sudosos-client';
import { type Ref, ref } from 'vue';
import Button from 'primevue/button';
import { useI18n } from 'vue-i18n';
import PayoutTable from '@/modules/financial/components/payout/PayoutTable.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createPayoutSchema } from '@/utils/validation-schema';
import FormDialog from '@/components/FormDialog.vue';
import PayoutCreateForm from '@/modules/financial/components/payout/forms/PayoutCreateForm.vue';
import CardComponent from '@/components/CardComponent.vue';
import PageContainer from '@/layout/PageContainer.vue';

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
