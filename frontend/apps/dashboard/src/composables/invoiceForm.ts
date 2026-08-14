import { watch, onBeforeMount, type Ref } from 'vue';

export function useInvoiceForm<TFormFields, TInvoice>(
  invoiceRef: Ref<TInvoice | undefined>,
  form: { context: { resetForm: (opts: { values: Partial<TFormFields> }) => void } },
  mapInvoiceToValues: (invoice: TInvoice) => Partial<TFormFields>,
) {
  function updateFieldValues(invoice?: TInvoice) {
    if (!invoice) return;
    form.context.resetForm({ values: mapInvoiceToValues(invoice) });
  }

  watch(invoiceRef, (newInvoice) => updateFieldValues(newInvoice));
  onBeforeMount(() => {
    if (invoiceRef.value) updateFieldValues(invoiceRef.value);
  });
}
