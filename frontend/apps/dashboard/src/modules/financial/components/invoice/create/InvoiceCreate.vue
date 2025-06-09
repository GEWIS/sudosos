<template>
  <CardComponent header="Create Invoice">
    <div class="flex flex-col gap-2 justify-between">
      <span class="p-error">
        <i class="pi pi-exclamation-circle" />{{ ' ' + t('modules.financial.invoice.create.warning') }}</span
      >
      <div class="flex flex-row justify-end">
        <ActionButton
          :disabled="disabled"
          :label="t('common.create')"
          :result="form.success?.value != null"
          :submitting="form.context.isSubmitting.value"
          type="submit"
          @click="form.submit"
        />
      </div>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import type { CreateInvoiceRequest } from '@sudosos/sudosos-client';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { useToast } from 'primevue/usetoast';
import type { AxiosResponse } from 'axios';
import type { InvoiceResponse } from '@sudosos/sudosos-client/src/api';
import { useRouter } from 'vue-router';
import { useInvoiceStore } from '@/stores/invoice.store';
import { handleError } from '@/utils/errorUtils';
import apiService from '@/services/ApiService';
import ActionButton from '@/components/ActionButton.vue';
import { createInvoiceObject } from '@/utils/validation-schema';
import { type Form, getProperty, setSubmit, setSuccess } from '@/utils/formUtils';
import CardComponent from '@/components/CardComponent.vue';

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

    const request: CreateInvoiceRequest = {
      forId: values.forId,
      byId,
      addressee: values.addressee,
      description: values.description,
      reference: values.reference,
      transactionIDs: values.transactionIDs,
      street: values.street,
      postalCode: values.postalCode,
      city: values.city,
      country: values.country,
      date: values.date,
      attention: values.attention,
      amount: values.transactionTotal,
    };

    apiService.invoices
      .createInvoice(request)
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
