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
        <PayoutTableYear />
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
import { type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { schemaToForm } from '@/utils/formUtils';
import { createPayoutSchema } from '@/utils/validation-schema';
import FormDialog from '@/components/FormDialog.vue';
import PayoutCreateForm from '@/modules/financial/components/payout/forms/PayoutCreateForm.vue';
import CardComponent from '@/components/CardComponent.vue';
import PageContainer from '@/layout/PageContainer.vue';
import PayoutTableYear from '@/modules/financial/components/payout/PayoutTableYear.vue';

const { t } = useI18n();

const showDialog: Ref<boolean> = ref(false);
const form = schemaToForm(createPayoutSchema);
</script>

<style scoped lang="scss"></style>
