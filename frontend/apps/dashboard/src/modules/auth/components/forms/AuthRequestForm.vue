<template>
  <form class="flex flex-col gap-2" @submit.prevent="() => form.submit()">
    <InputSpan
      id="email"
      v-bind="form.model.email.attr.value"
      class="max-w-[15rem]"
      column
      :errors="form.context.errors.value.email"
      inline-error
      :label="t('modules.auth.reset.enterEmail')"
      :placeholder="t('modules.auth.reset.enterEmail')"
      type="text"
      :value="form.model.email.value.value"
      @update:value="form.context.setFieldValue('email', $event)"
    />
    <Button :label="t('modules.auth.reset.reset')" type="submit" />
  </form>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { type Form, setSubmit } from '@/utils/formUtils';
import { authRequestSchema } from '@/utils/validation-schema';
import InputSpan from '@/components/InputSpan.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof authRequestSchema>>>,
    required: true,
  },
});

const emit = defineEmits(['success']);

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    apiService.authenticate
      .resetLocal({ accountMail: values.email })
      .then(() => {
        emit('success');
      })
      .catch((err) => {
        handleError(err, toast);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
