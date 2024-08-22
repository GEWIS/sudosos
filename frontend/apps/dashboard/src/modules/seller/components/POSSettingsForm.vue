<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="$t('c_posInfo.name')"
               :value="form.model.name.value.value"
               :attributes="form.model.name.attr.value"
               @update:value="form.context.setFieldValue('name', $event)"
               :errors="form.context.errors.value.name"
               id="name" :placeholder="$t('c_posInfo.posName')" type="text" :disabled="!edit"/>
    <InputSpan :label="$t('c_posInfo.useAuthentication')"
               :value="form.model.useAuthentication.value.value"
               :attributes="form.model.useAuthentication.attr.value"
               @update:value="form.context.setFieldValue('useAuthentication', $event)"
               :errors="form.context.errors.value.useAuthentication"
               id="useAuthentication" type="boolean" :disabled="!edit"/>

  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { type PropType } from "vue";
import type { PointOfSaleResponse } from "@sudosos/sudosos-client";
import { type Form, setSubmit } from "@/utils/formUtils";
import { updatePointOfSaleObject } from "@/utils/validation-schema";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import * as yup from "yup";
import { handleError } from "@/utils/errorUtils";
import { usePointOfSaleStore } from "@/stores/pos.store";

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['update:edit']);
const pointOfSaleStore = usePointOfSaleStore();

const props = defineProps({
  pointOfSale: {
    type: Object as PropType<PointOfSaleResponse>,
    required: true
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updatePointOfSaleObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  if (!props.form.context.meta.value.dirty) {
    emit('update:edit', false);
    return;
  }
  await pointOfSaleStore.updatePointOfSale(props.pointOfSale.id, values).then(() => {
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.pointOfSaleUpdated'),
      life: 3000,
    });
    emit('update:edit', false);
  }).catch((error) => {
    handleError(error, toast);
  });
}));
</script>

<style scoped lang="scss">

</style>
