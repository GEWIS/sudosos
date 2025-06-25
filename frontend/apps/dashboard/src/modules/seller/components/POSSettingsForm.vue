<template>
  <div class="flex flex-col gap-2 justify-between">
    <InputSpan
      id="name"
      class="max-w-[15rem]"
      v-bind="form.model.name.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.name"
      :label="t('common.name')"
      :placeholder="t('modules.seller.posOverview.list.posName')"
      type="text"
      :value="form.model.name.value.value"
      @update:value="form.context.setFieldValue('name', $event)"
    />
    <InputSpan
      id="useAuthentication"
      v-bind="form.model.useAuthentication.attr.value"
      :disabled="!edit"
      :errors="form.context.errors.value.useAuthentication"
      :label="t('modules.seller.forms.pos.useAuthentication')"
      type="boolean"
      :value="form.model.useAuthentication.value.value"
      @update:value="form.context.setFieldValue('useAuthentication', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import type { PointOfSaleResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import { updatePointOfSaleObject } from '@/utils/validation-schema';
import { type Form, setSubmit } from '@/utils/formUtils';
import InputSpan from '@/components/InputSpan.vue';
import { handleError } from '@/utils/errorUtils';
import { usePointOfSaleStore } from '@/stores/pos.store';

const { t } = useI18n();
const toast = useToast();

const emit = defineEmits(['update:edit']);
const pointOfSaleStore = usePointOfSaleStore();

const props = defineProps({
  pointOfSale: {
    type: Object as PropType<PointOfSaleResponse>,
    required: true,
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

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    if (!props.form.context.meta.value.dirty) {
      emit('update:edit', false);
      return;
    }
    pointOfSaleStore
      .updatePointOfSale(props.pointOfSale.id, values)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.pointOfSaleUpdated'),
          life: 3000,
        });
        emit('update:edit', false);
      })
      .catch((error) => {
        handleError(error, toast);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
