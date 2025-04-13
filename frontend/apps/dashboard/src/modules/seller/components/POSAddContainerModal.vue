<template>
  <FormDialog
    v-model:model-value="isVisible"
    :form="form"
    :header="t('modules.seller.productContainers.containers.addExisting')"
    :is-editable="true"
  >
    <template #form="slotProps">
      <POSAddContainerForm v-model:is-visible="isVisible" :associated-pos="associatedPos" :form="slotProps.form" />
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import type { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import { addContainerObject } from '@/utils/validation-schema';
import FormDialog from '@/components/FormDialog.vue';
import { schemaToForm } from '@/utils/formUtils';
import POSAddContainerForm from '@/modules/seller/components/POSAddContainerForm.vue';

const { t } = useI18n();

const isVisible = defineModel<boolean>('isVisible', { required: true });

const form = schemaToForm(addContainerObject);

defineProps<{
  associatedPos: PointOfSaleWithContainersResponse;
}>();
</script>

<style scoped lang="scss"></style>
