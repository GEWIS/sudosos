<template>
  <div class="page-container">
    <div class="page-title">{{ t('payout.Payouts overview') }}</div>
    <div class="content-wrapper flex flex-column">
      <div class="flex flex-row justify-content-end w-full -mb-5">
        <Button
            type="button"
            severity="primary"
            class="z-5"
            :label="t('payout.Create payout')"
            icon="pi pi-plus"
            @click="showDialog = true"
        />
      </div>
      <TabView class="w-full">
        <TabPanel v-for="state in states" :key="state" :header="state">
          <PayoutTable :state="state"/>
        </TabPanel>
      </TabView>
    </div>
    <FormDialog v-model="showDialog" :form="form" :header="t('payout.Create payout')">
      <template #form="slotProps">
        <PayoutCreateForm :form="slotProps.form" @submit:success="showDialog = false"/>
      </template>
    </FormDialog>
  </div>
</template>

<script setup lang="ts">
import { PayoutRequestStatusRequestStateEnum } from "@sudosos/sudosos-client";
import { type Ref, ref } from "vue";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";
import PayoutTable from "@/modules/financial/components/payout/PayoutTable.vue";
import Button from "primevue/button";
import { schemaToForm } from "@/utils/formUtils";
import { createPayoutSchema } from "@/utils/validation-schema";
import FormDialog from "@/components/FormDialog.vue";
import PayoutCreateForm from "@/modules/financial/components/payout/forms/PayoutCreateForm.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const states = [PayoutRequestStatusRequestStateEnum.Created, PayoutRequestStatusRequestStateEnum.Approved,
  PayoutRequestStatusRequestStateEnum.Denied, PayoutRequestStatusRequestStateEnum.Cancelled];

const showDialog: Ref<boolean> = ref(false);
const form = schemaToForm(createPayoutSchema);
</script>

<style scoped lang="scss">
</style>
