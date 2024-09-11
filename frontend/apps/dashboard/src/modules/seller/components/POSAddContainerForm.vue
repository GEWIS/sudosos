

<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputContainerSpan
        :label="t('modules.seller.productContainers.containers.container')"
        :container="form.model.container.value.value"
        :errors="form.context.errors.value.container"
        @update:container="form.context.setFieldValue('container', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import * as yup from "yup";
import { addContainerObject } from "@/utils/validation-schema";
import { type Form, setSubmit } from "@/utils/formUtils";
import { useI18n } from "vue-i18n";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";
import InputContainerSpan from "@/components/InputContainerSpan.vue";
import type { PointOfSaleWithContainersResponse } from "@sudosos/sudosos-client";

const props = defineProps<{
  form: Form<yup.InferType<typeof addContainerObject>>,
  associatedPos: PointOfSaleWithContainersResponse
}>();

const isVisible = defineModel('isVisible');

const { t } = useI18n();
const pointOfSaleStore = usePointOfSaleStore();
const toast = useToast();

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  isVisible.value = false;

  await pointOfSaleStore.updatePointOfSale(props.associatedPos.id, {
    name: props.associatedPos.name,
    useAuthentication: props.associatedPos.useAuthentication,
    containers: [values.container, ...props.associatedPos.containers].map(c => c.id),
    id: props.associatedPos.id,
    cashierRoleIds: props.associatedPos.cashierRoles.map(c => c.id)
  }).then(() => {
    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.pointOfSaleUpdated'),
      life: 3000,
    });
  }).catch((error) => {
    handleError(error, toast);
  });
}));

</script>

<style scoped lang="scss">

</style>
