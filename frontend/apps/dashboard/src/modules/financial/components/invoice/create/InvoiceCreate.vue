<template>
  <ActionButton
    :disabled="disabled"
    :label="t('common.create')"
    :result="form.success?.value"
    :submitting="form.context.isSubmitting.value"
    type="submit"
    @click="form.submit"
  />
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import type { InvoiceResponse } from '@gewis/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'openvue/usetoast';
import type { AxiosResponse } from 'axios';
import { useRouter } from 'vue-router';
import { useInvoiceStore } from '@/stores/invoice.store';
import { handleError } from '@/utils/errorUtils';
import apiService from '@/services/ApiService';
import ActionButton from '@/components/ActionButton.vue';
import { createInvoiceObject } from '@/utils/validation-schema';
import { type Form, getProperty, setSubmit, setSuccess } from '@/utils/formUtils';
import { toCreateInvoiceRequest } from '@/utils/invoiceUtil';

const { t } = useI18n();
const toast = useToast();
const authStore = useAuthStore();
const invoiceStore = useInvoiceStore();
const router = useRouter();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof createInvoiceObject>>>,
    required: true,
  },
});

const disabled = computed(() => {
  return !props.form?.context.meta.value.valid || getProperty(props.form, 'forId') === undefined;
});

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    const byId = authStore.user?.id;
    if (byId === undefined) {
      setSuccess(props.form, false);
      return;
    }

    apiService.invoices
      .createInvoice({ createInvoiceRequest: toCreateInvoiceRequest(values, byId) })
      .then(async (invoiceResult: AxiosResponse<InvoiceResponse>) => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('common.toast.success.invoiceCreated'),
          life: 3000,
        });

        const invoice = invoiceResult.data;
        await invoiceStore.fetchInvoicePdf(invoice.id).finally(() => {
          setSuccess(props.form, true);
          props.form.context.resetForm();
          void router.push({ name: 'invoiceInfo', params: { id: invoice.id } });
        });
      })
      .catch((error) => {
        setSuccess(props.form, false);
        handleError(error, toast);
      });
  }),
);
</script>

<style scoped lang="scss"></style>
