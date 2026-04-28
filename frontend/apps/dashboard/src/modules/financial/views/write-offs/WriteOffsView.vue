<template>
  <PageContainer>
    <div class="flex flex-col">
      <CardComponent class="w-full mb-5" :header="t('modules.financial.write-offs.overview.header')">
        <WriteOffUserOverview />
      </CardComponent>
      <CardComponent class="w-full" :header="t('modules.financial.write-offs.table.header')">
        <template #topAction>
          <Button icon="pi pi-plus" :label="t('common.create')" @click="showDialog = true" />
        </template>
        <WriteOffTableYear />
        <FormDialog
          v-model="showDialog"
          :confirm="true"
          :form="form"
          :header="t('modules.financial.write-offs.create')"
          :is-editable="true"
        >
          <template #form="slotProps">
            <WriteOffCreateForm :form="slotProps.form" @submit:success="showDialog = false" />
          </template>
        </FormDialog>
      </CardComponent>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CardComponent from '@/components/CardComponent.vue';
import WriteOffUserOverview from '@/modules/financial/components/write-offs/WriteOffUserOverview.vue';
import PageContainer from '@/layout/PageContainer.vue';
import WriteOffTableYear from '@/modules/financial/components/write-offs/WriteOffTableYear.vue';
import FormDialog from '@/components/FormDialog.vue';
import WriteOffCreateForm from '@/modules/financial/components/write-offs/forms/WriteOffCreateForm.vue';
import { schemaToForm } from '@/utils/formUtils';
import { createWriteOffSchema } from '@/utils/validation-schema';

const { t } = useI18n();

const showDialog = ref(false);
const form = schemaToForm(createWriteOffSchema);
</script>

<style scoped lang="scss"></style>
