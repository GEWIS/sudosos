

<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="$t('common.name')"
               :value="form.model.name.value.value"
               :attributes="form.model.name.attr.value"
               @update:value="form.context.setFieldValue('name', $event)"
               :errors="form.context.errors.value.name"
               id="name" :placeholder="$t('c_posInfo.posName')" type="text"/>
    <InputSpan :label="$t('c_posInfo.useAuthentication')"
               :value="form.model.useAuthentication.value.value"
               :attributes="form.model.useAuthentication.attr.value"
               @update:value="form.context.setFieldValue('useAuthentication', $event)"
               :errors="form.context.errors.value.useAuthentication"
               id="useAuthentication" type="boolean"/>

    <InputOrganSpan
        :label="$t('common.owner')"
        :organ="form.model.owner.value.value"
        :errors="form.context.errors.value.owner"
        @update:organ="form.context.setFieldValue('owner', $event)"
      />
  </div>
</template>

<script setup lang="ts">

import InputSpan from "@/components/InputSpan.vue";
import * as yup from "yup";
import type { createPointOfSaleObject } from "@/utils/validation-schema";
import { type Form, setSubmit } from "@/utils/formUtils";
import { useI18n } from "vue-i18n";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";
import InputOrganSpan from "@/components/InputOrganSpan.vue";

const props = defineProps<{
  form: Form<yup.InferType<typeof createPointOfSaleObject>>
}>();

const isVisible = defineModel('isVisible');

const { t } = useI18n();
const pointOfSaleStore = usePointOfSaleStore();
const toast = useToast();

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  isVisible.value = false;
  await pointOfSaleStore.createPointOfSale({
    name: values.name,
    useAuthentication: values.useAuthentication,
    ownerId: values.owner.id,
    containers: [],
    cashierRoleIds: []
  }).then(() => {
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.pointOfSaleCreated'),
      life: 3000,
    });
  }).catch((error) => {
    handleError(error, toast);
  });
}));

</script>

<style scoped lang="scss">

</style>