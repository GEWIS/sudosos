<template>
  <CardComponent :header="t('common.info')" v-if="invoice" >
    <template #topAction>
      <Button
          v-if="notDeleted"
          severity="primary"
          :label="t('common.delete')"
          icon="pi pi-exclamation-triangle"
          @click="visible = true"
      />
    </template>
    <div class="flex flex-column justify-content-between">
      <InfoSpan :label="t('common.id')"
                :value="String(invoice.id)"/>

      <InfoSpan :label="t('common.for')"
                :value="invoice.to.firstName + ' ' + invoice.to.lastName + ' (' + invoice.to.id + ')'"/>

      <InfoSpan :label="t('common.createdAt')"
                :value="formatDateTime(new Date(invoice.createdAt ? invoice.createdAt.toString() : ''))"/>

      <InfoSpan :label="t('common.updatedAt')"
                :value="formatDateTime(new Date(invoice.updatedAt ? invoice.updatedAt.toString() : ''))"/>
    </div>
    <Dialog
        v-model:visible="visible"
        :header="t('modules.financial.invoice.delete')"
        :draggable="false"
        modal
        :close-on-escape="true"
        ref="dialog"
        @show="openDialog"
    >
      <div class="flex flex-column justify-content-between gap-3">
        <div>
          {{ t('modules.financial.invoice.confirmDelete') }}
          <br>
          {{ t('modules.financial.invoice.creditNoteWarning') }}
          <br>
          <br>
          {{  t('modules.financial.invoice.unrecoverable') }}
        </div>
        <div class="flex gap-3 flex-row justify-content-end align-items-end">
          <Button severity="secondary" @click="dialog.close()">{{ t('common.cancel') }}</Button>
          <Button @click="deleteInvoice">{{ t('common.delete') }}</Button>
        </div>
      </div>
    </Dialog>
  </CardComponent>
</template>

<script setup lang="ts">
import { formatDateTime } from "@/utils/formatterUtils";
import CardComponent from "@/components/CardComponent.vue";
import InfoSpan from "@/components/InfoSpan.vue";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import Dialog from "primevue/dialog";
import { InvoiceStatusResponseStateEnum } from "@sudosos/sudosos-client/src/api";
import { useToast } from "primevue/usetoast";
import { useInvoiceStore } from "@/stores/invoice.store";
import { handleError } from "@/utils/errorUtils";

const { t } = useI18n();

const toast = useToast();
const invoiceStore = useInvoiceStore();
const dialog = ref();
const visible = ref(false);
const notDeleted = computed(() => invoice.value?.currentState.state !== InvoiceStatusResponseStateEnum.Deleted);
const invoice = computed(() => invoiceStore.getInvoice(props.invoiceId));

const props = defineProps({
  invoiceId: {
    type: Number,
    required: true
  },
});

const openDialog = () => {
  addListenerOnDialogueOverlay(dialog.value);
};

const deleteInvoice = async () => {
  await invoiceStore.deleteInvoice(props.invoiceId).then(() => {
    toast.add({
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.invoiceDeleted'),
      severity: 'success',
      life: 3000
    });
  }).catch((err) => {
    handleError(err, toast);
  }).finally(() => {
    dialog.value.close();
  });
};
</script>

<style scoped lang="scss">

</style>
