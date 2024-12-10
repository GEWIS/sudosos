<template>
  <FormDialog :header="t('modules.seller.forms.pos.create')" v-model:modelValue="isVisible"
              :form="form" :is-editable="true">
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
