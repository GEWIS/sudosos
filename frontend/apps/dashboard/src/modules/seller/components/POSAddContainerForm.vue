<template>
  <div class="flex flex-column gap-2 justify-content-between">
    <InputContainerSpan
      :container="form.model.container.value.value"
      :errors="form.context.errors.value.container"
      :label="t('modules.seller.productContainers.containers.container')"
      @update:container="form.context.setFieldValue('container', $event!)"
    />
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import type { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { addContainerObject } from '@/utils/validation-schema';
import { type Form, setSubmit } from '@/utils/formUtils';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { handleError } from '@/utils/errorUtils';
import InputContainerSpan from '@/components/InputContainerSpan.vue';

const props = defineProps<{
  form: Form<yup.InferType<typeof addContainerObject>>;
  associatedPos: PointOfSaleWithContainersResponse;
}>();

const isVisible = defineModel<boolean>('isVisible');

const { t } = useI18n();
const pointOfSaleStore = usePointOfSaleStore();
const toast = useToast();

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    isVisible.value = false;

    pointOfSaleStore
      .updatePointOfSale(props.associatedPos.id, {
        name: props.associatedPos.name,
        useAuthentication: props.associatedPos.useAuthentication,
        containers: [values.container, ...props.associatedPos.containers].map((c) => c.id),
        id: props.associatedPos.id,
        cashierRoleIds: props.associatedPos.cashierRoles.map((c) => c.id),
      })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.pointOfSaleUpdated'),
          life: 3000,
        });
      })
      .catch((error) => {
        handleError(error, toast);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
