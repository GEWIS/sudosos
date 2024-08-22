<template>
  <FormDialog :header="$t('c_posInfo.overview')" v-model:modelValue="isVisible"
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


const isVisible = defineModel<boolean>('isVisible', { required: true });

const form = schemaToForm(addContainerObject);

const props = defineProps<{
  associatedPos: PointOfSaleWithContainersResponse
}>();
</script>

<style scoped lang="scss">

</style>