import { watch, onBeforeMount, type Ref } from 'vue';

export function useTransactionForm<TFormFields, TTransaction>(
  transactionRef: Ref<TTransaction | undefined>,
  form: { context: { resetForm: (opts: { values: Partial<TFormFields> }) => void } },
  mapTransactionToValues: (transaction: TTransaction) => Partial<TFormFields>,
) {
  function updateFieldValues(transaction?: TTransaction) {
    if (!transaction) return;
    form.context.resetForm({ values: mapTransactionToValues(transaction) });
  }

  watch(transactionRef, (newTransaction) => updateFieldValues(newTransaction));
  onBeforeMount(() => {
    if (transactionRef.value) updateFieldValues(transactionRef.value);
  });
}
