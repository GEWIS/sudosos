<template>
  <FormDialog
    v-model:model-value="isVisible"
    :form="form"
    :header="t('modules.seller.forms.pos.create')"
    :is-editable="true"
  >
    <template #form="slotProps">
      <POSCreateForm v-model:is-visible="isVisible" :form="slotProps.form" />
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { createPointOfSaleObject } from '@/utils/validation-schema';
import FormDialog from '@/components/FormDialog.vue';
import { schemaToForm } from '@/utils/formUtils';
import POSCreateForm from '@/modules/seller/components/POSCreateForm.vue';

const { t } = useI18n();

const isVisible = defineModel<boolean>('isVisible', { required: true });

const form = schemaToForm(createPointOfSaleObject);
</script>

<style scoped lang="scss"></style>
