import { computed, ref } from 'vue';
import type { InvoiceResponse } from '@sudosos/sudosos-client';
import { InvoiceStatusResponseStateEnum } from '@sudosos/sudosos-client/src/api';
import { useInvoiceStore } from '@/stores/invoice.store';

export function useInvoiceCard(invoiceId: number) {
  const invoiceStore = useInvoiceStore();
  const invoice = computed(() => invoiceStore.getInvoice(invoiceId) as InvoiceResponse);
  const deleted = computed(() => invoice.value?.currentState.state === InvoiceStatusResponseStateEnum.Deleted);
  const paid = computed(() => invoice.value?.currentState.state === InvoiceStatusResponseStateEnum.Paid);
  const canEdit = computed(() => !deleted.value && !paid.value);
  const edit = ref(false);

  return { invoice, deleted, paid, edit, canEdit };
}
