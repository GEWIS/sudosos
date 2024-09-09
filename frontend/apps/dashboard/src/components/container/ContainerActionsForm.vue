<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan
        :value="form.model.name.value.value"
        :attributes="form.model.name.attr.value"
        @update:value="form.context.setFieldValue('name', $event)"
        :errors="form.context.errors.value.name"
        id="name" :placeholder="t('common.name')"
        :label="t('common.name')"/>

    <InputOrganSpan
        :organ="form.model.owner.value.value"
        :organs="!isOrganEditable
                        ? [form.model.owner.value.value]
                        : undefined"
        :disabled="!isOrganEditable"
        :attributes="form.model.owner.attr.value"
        @update:organ="form.context.setFieldValue('owner', $event)"
        :errors="form.context.errors.value.owner"
        id="owner" :placeholder="t('c_containerEditModal.Select owner')"
        :label="t('c_containerEditModal.Owner')"/>

    <InputSpan
        :value="form.model.public.value.value"
        :attributes="form.model.public.attr.value"
        @update:value="form.context.setFieldValue('public', $event)"
        :errors="form.context.errors.value.public"
        id="public" :placeholder="t('c_containerEditModal.Public')"
        :label="t('c_containerEditModal.Public')" type="boolean"
      />
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import type { Form } from "@/utils/formUtils";
import * as yup from "yup";
import { containerActionSchema } from "@/utils/validation-schema";
import InputOrganSpan from "@/components/InputOrganSpan.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  form: Form<yup.InferType<typeof containerActionSchema>>,
  isOrganEditable?: boolean,
}>();

</script>

<style scoped>

</style>