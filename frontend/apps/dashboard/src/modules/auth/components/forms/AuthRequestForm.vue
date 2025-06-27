<template>
  <form autocomplete="off" class="flex flex-col" @submit.prevent="() => form.submit()">
    <InputSpan
      id="email"
      v-bind="form.model.email.attr.value"
      column
      :errors="form.context.errors.value.email"
      inline-error
      :label="t('common.email')"
      :placeholder="t('modules.auth.reset.enterEmail')"
      type="text"
      :value="form.model.email.value.value"
      @update:value="form.context.setFieldValue('email', $event)"
    />
    <Button
      class="items-center flex justify-center mx-auto my-3 w-full"
      :label="t('modules.auth.reset.reset')"
      type="submit"
    />
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
