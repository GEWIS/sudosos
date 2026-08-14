<template>
  <div class="flex flex-col gap-2 justify-between">
    <InputSpan
      id="name"
      v-bind="form.model.name.attr.value"
      :errors="form.context.errors.value.name"
      :label="t('common.name')"
      :placeholder="t('common.placeholders.pos')"
      type="text"
      :value="form.model.name.value.value"
      @update:value="form.context.setFieldValue('name', $event)"
    />
    <InputSpan
      id="useAuthentication"
      v-bind="form.model.useAuthentication.attr.value"
      :errors="form.context.errors.value.useAuthentication"
      :label="t('modules.seller.forms.pos.useAuthentication')"
      type="boolean"
      :value="form.model.useAuthentication.value.value"
      @update:value="form.context.setFieldValue('useAuthentication', $event)"
    />

    <InputOrganSpan
      :errors="form.context.errors.value.owner"
      :label="t('common.owner')"
      :organ="form.model.owner.value.value"
      @update:organ="form.context.setFieldValue('owner', $event!)"
    />
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import InputSpan from '@/components/InputSpan.vue';
import type { createPointOfSaleObject } from '@/utils/validation-schema';
import { type Form, setSubmit } from '@/utils/formUtils';
import { usePointOfSaleStore } from '@/stores/pos.store';
import { handleError } from '@/utils/errorUtils';
import InputOrganSpan from '@/components/InputOrganSpan.vue';

const props = defineProps<{
  form: Form<yup.InferType<typeof createPointOfSaleObject>>;
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
      .createPointOfSale({
        name: values.name,
        useAuthentication: values.useAuthentication,
        ownerId: values.owner.id,
        containers: [],
        cashierRoleIds: [],
      })
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.pointOfSaleCreated'),
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
