<template>
  <FormDialog :header="t('c_posInfo.overview')" v-model:modelValue="isVisible"
              :form="form">
    <template #form="slotProps">
      <POSAddContainerForm :form="slotProps.form" :associatedPos="associatedPos" v-model:isVisible="isVisible"/>
    </template>

  </FormDialog>
</template>

<script setup lang="ts">
import { addContainerObject } from "@/utils/validation-schema";
import FormDialog from "@/components/FormDialog.vue";
import { schemaToForm } from "@/utils/formUtils";
import POSAddContainerForm from "@/modules/seller/components/POSAddContainerForm.vue";
import type { PointOfSaleWithContainersResponse } from "@sudosos/sudosos-client";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const isVisible = defineModel<boolean>('isVisible', { required: true });

const form = schemaToForm(addContainerObject);

defineProps<{
  associatedPos: PointOfSaleWithContainersResponse
}>();
</script>

<style scoped lang="scss">

</style>
