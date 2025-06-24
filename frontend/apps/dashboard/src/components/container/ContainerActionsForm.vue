<template>
  <div class="flex flex-col gap-2 justify-between">
    <InputSpan
      id="name"
      v-bind="form.model.name.attr.value"
      :disabled="!isEditable"
      :errors="form.context.errors.value.name"
      :label="t('common.name')"
      :placeholder="t('common.name')"
      :value="form.model.name.value.value"
      @update:value="form.context.setFieldValue('name', $event)"
    />

    <InputOrganSpan
      id="owner"
      v-bind="form.model.owner.attr.value"
      :disabled="!isEditable || !isOrganEditable"
      :errors="form.context.errors.value.owner"
      :label="t('common.owner')"
      :organ="form.model.owner.value.value"
      :organs="!isOrganEditable ? [form.model.owner.value.value] : undefined"
      :placeholder="t('modules.seller.forms.common.selectOwner')"
      @update:organ="form.context.setFieldValue('owner', $event!)"
    />

    <InputSpan
      id="public"
      v-bind="form.model.public.attr.value"
      :disabled="!isEditable"
      :errors="form.context.errors.value.public"
      :label="t('modules.seller.productContainers.containers.public')"
      :placeholder="t('modules.seller.productContainers.containers.public')"
      type="boolean"
      :value="form.model.public.value.value"
      @update:value="form.context.setFieldValue('public', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import InputSpan from '@/components/InputSpan.vue';
import type { Form } from '@/utils/formUtils';
import { containerActionSchema } from '@/utils/validation-schema';
import InputOrganSpan from '@/components/InputOrganSpan.vue';

const { t } = useI18n();

defineProps<{
  form: Form<yup.InferType<typeof containerActionSchema>>;
  isOrganEditable?: boolean;
  isEditable: boolean;
}>();
</script>

<style scoped></style>
