<template>
  <FormCard
    v-if="pointOfSale"
    :enable-edit="isAllowed('update', ['own', 'organ'], 'PointOfSale', ['any'])"
    :form="form"
    :header="t('modules.seller.forms.pos.overview')"
    @cancel="updateFieldValues(pointOfSale)"
    @save="formSubmit"
    @update:model-value="edit = $event"
  >
    <div class="flex flex-col gap-2 justify-between">
      <POSSettingsForm :edit="edit" :form="form" :point-of-sale="pointOfSale" @update:edit="edit = $event" />
      <div class="flex flex-row justify-end">
        <Button
          v-if="isAllowed('delete', ['own', 'organ'], 'PointOfSale', ['any'])"
          :disabled="!edit"
          icon="pi pi-trash"
          :label="t('common.delete')"
          outlined
          @click="handleDelete"
        />
        <ConfirmDialog ref="deleteConfirm"></ConfirmDialog>
      </div>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, watch } from 'vue';
import type { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { useConfirm } from 'primevue/useconfirm';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import FormCard from '@/components/FormCard.vue';
import { updatePointOfSaleObject } from '@/utils/validation-schema';
import { schemaToForm } from '@/utils/formUtils';
import { usePointOfSaleStore } from '@/stores/pos.store';
import POSSettingsForm from '@/modules/seller/components/POSSettingsForm.vue';
import router from '@/router';
import { handleError } from '@/utils/errorUtils';
import { isAllowed } from '@/utils/permissionUtils';

const confirm = useConfirm();

const edit = ref(false);
const posStore = usePointOfSaleStore();
const pointOfSale = ref<PointOfSaleWithContainersResponse>();

const props = defineProps({
  posId: {
    type: Number,
    required: true,
  },
});

const form = schemaToForm(updatePointOfSaleObject);

const formSubmit = async () => {
  await form.submit();
};
const updateFieldValues = (p: PointOfSaleWithContainersResponse) => {
  if (!p) return;

  const name = p.name;
  const useAuthentication = p.useAuthentication;
  const containers = p.containers.map((c) => c.id);
  const id = p.id;
  const cashierRoleIds = p.cashierRoles.map((c) => c.id);

  form.context.resetForm({ values: { name, useAuthentication, id, cashierRoleIds, containers } });
};

const { t } = useI18n();
const toast = useToast();

const deleteConfirm = ref<HTMLElement | undefined>();
function handleDelete() {
  confirm.require({
    message: t('modules.seller.singlePos.confirmDelete'),
    target: deleteConfirm.value,
    header: t('common.delete'),
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.close'),
    acceptIcon: 'pi pi-trash',
    rejectIcon: 'pi pi-times',
    accept: () => {
      posStore
        .deletePointOfSale(props.posId)
        .then(() => {
          void router.push({ name: 'pointOfSale' });
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.pointOfSaleDeleted'),
            severity: 'success',
            life: 3000,
          });
        })
        .catch((err) => {
          handleError(err, toast);
        });
    },
  });
}

watch(
  () => pointOfSale.value,
  (newValue) => {
    updateFieldValues(newValue!);
  },
);

onBeforeMount(async () => {
  pointOfSale.value = await posStore.getPointOfSale(props.posId);
  if (pointOfSale.value) {
    updateFieldValues(pointOfSale.value);
  }
});
</script>

<style scoped lang="scss"></style>
