<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="t('modules.user.profile.pinNew')"
               :value="form.model.pin.value.value || ''"
               :attributes="form.model.pin.attr.value"
               @update:value="form.context.setFieldValue('pin', $event)"
               :errors="form.context.errors.value.pin"
               id="pin" type="pin"
               :disabled="!edit"
               autocomplete="new-password"
    />
    <InputSpan :label="t('modules.user.profile.pinConfirm')"
               :value="form.model.pinConfirm.value.value"
               :attributes="form.model.pinConfirm.attr.value"
               @update:value="form.context.setFieldValue('pinConfirm', $event)"
               :errors="form.context.errors.value.pinConfirm"
               id="pinConfirm" type="pin"
               :disabled="!edit"
    />
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import { type Form, setSubmit } from "@/utils/formUtils";
import * as yup from "yup";
import type { editPinSchema } from "@/utils/validation-schema";
import type { PropType } from "vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { useToast } from "primevue/usetoast";
import apiService from "@/services/ApiService";
import { handleError } from "@/utils/errorUtils";

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof editPinSchema>>>,
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
    apiService.user.updateUserPin(
        userStore.getCurrentUser.user.id,
        { pin: values.pinConfirm })
        .then(() => {
          emit('submit:success', values);
          toast.add({
            severity: "success",
            summary: t('common.toast.success.success'),
            detail: `${t('common.toast.success.pinUpdated')}`,
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
