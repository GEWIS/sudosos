<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="t('profile.passwordNew')"
               :value="form.model.password.value.value"
               :attributes="form.model.password.attr.value"
               @update:value="form.context.setFieldValue('password', $event)"
               :errors="form.context.errors.value.password"
               id="password" type="password"
    />
    <InputSpan :label="t('profile.passwordConfirm')"
               :value="form.model.passwordConfirm.value.value"
               :attributes="form.model.passwordConfirm.attr.value"
               @update:value="form.context.setFieldValue('passwordConfirm', $event)"
               :errors="form.context.errors.value.passwordConfirm"
               id="passwordConfirm" type="password"
    />
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import { type Form, setSubmit } from "@/utils/formUtils";
import * as yup from "yup";
import { editPasswordSchema } from "@/utils/validation-schema";
import type { PropType } from "vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { useToast } from "primevue/usetoast";
import apiService from "@/services/ApiService";
import { handleError } from "@/utils/errorUtils";

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof editPasswordSchema>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const { t } = useI18n();
const userStore = useUserStore();
const toast = useToast();
const emit = defineEmits(['submit:success', 'submit:error']);

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  if (userStore.getCurrentUser.user) {
    apiService.user.updateUserLocalPassword(
        userStore.getCurrentUser.user.id,
        { password: values.passwordConfirm })
        .then(() => {
          emit('submit:success', values);
          toast.add({
            severity: "success",
            summary: t('successMessages.success'),
            detail: `${t('successMessages.passwordUpdated')}`,
            life: 3000,
          });
          props.form.context.resetForm();
        })
        .catch((err) => {
          emit('submit:error', err);
          handleError(err, toast);
        });
  }
}));
</script>

<style scoped lang="scss">

</style>
