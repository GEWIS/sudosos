<template>
  <div class="flex flex-column">
    <InputSpan :label="t('common.amount')"
               :value="form.model.amount.value.value"
               :attributes="form.model.amount.attr.value"
               @update:value="form.context.setFieldValue('amount', $event)"
               :errors="form.context.errors.value.amount"
               id="name" :placeholder="t('common.amount')" type="currency" />
    <div
        class="flex justify-content-end font-italic underline cursor-pointer text-color-secondary"
        @click="setToWaiveAll"
    >
      {{ t('modules.admin.singleUser.balance.waiveAllFines') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { type Form, setSubmit } from "@/utils/formUtils";
import type { BalanceResponse, UserResponse } from "@sudosos/sudosos-client";
import { type PropType } from "vue";
import * as yup from "yup";
import { waiveUserFineSchema } from "@/utils/validation-schema";
import { handleError } from "@/utils/errorUtils";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";

const { t } = useI18n();
const toast = useToast();

const isVisible = defineModel('isVisible');

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true
  },
  balance: {
    type: Object as PropType<BalanceResponse>,
    required: true
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof waiveUserFineSchema>>>,
    required: true,
  },
});

const userStore = useUserStore();

function setToWaiveAll() {
  props.form.context.setFieldValue('amount', props.balance.fine!.amount/100);
}

setSubmit(props.form, props.form.context.handleSubmit(async (values) => {
  if (props.balance.fine && values.amount*100 > props.balance.fine.amount) {
    props.form.context.setFieldError(
        'amount',
        t('modules.admin.singleUser.balance.waiveFineTooMuch')
    );
    return;
  }

  await userStore.waiveUserFine(
      props.user.id,
      {
        amount: values.amount*100,
        currency: 'EUR',
        precision: 2
      },
      apiService
  ).then(async () => {
    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.waiveFinesSuccess'),
      life: 3000
    });
    await userStore.fetchUserBalance(props.user.id, apiService);
    isVisible.value = false;
  }).catch((error) => {
    handleError(error, toast);
  });
}));
</script>
