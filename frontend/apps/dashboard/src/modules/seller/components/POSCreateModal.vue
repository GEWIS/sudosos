<template>
  <FormDialog :header="t('c_posInfo.overview')" v-model:modelValue="isVisible"
              :form="form">
    <template #form="slotProps">
      <POSCreateForm :form="slotProps.form" v-model:isVisible="isVisible"/>
    </template>

  </FormDialog>
</template>

<script setup lang="ts">
import { createPointOfSaleObject } from "@/utils/validation-schema";
import FormDialog from "@/components/FormDialog.vue";
import { schemaToForm } from "@/utils/formUtils";
import POSCreateForm from "@/modules/seller/components/POSCreateForm.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const isVisible = defineModel<boolean>('isVisible', { required: true });

const form = schemaToForm(createPointOfSaleObject);
</script>

<style scoped lang="scss">

</style>
