<template>
  <FormCard :header="t('modules.seller.forms.pos.overview')" v-if="pointOfSale" @cancel="updateFieldValues(pointOfSale)"
            @update:modelValue="edit = $event" @save="formSubmit"
            :enableEdit="isAllowed('update', ['own', 'organ'], 'PointOfSale', ['any'])">
    <div class="flex flex-column justify-content-between gap-2">
      <POSSettingsForm :point-of-sale="pointOfSale" :form="form" :edit="edit" @update:edit="edit = $event"/>
      <div class="flex flex-row justify-content-end">
        <Button
            v-if="isAllowed('delete', ['own', 'organ'], 'PointOfSale', ['any'])"
            :disabled="!edit"
            @click="handleDelete"
            icon="pi pi-trash"
            :label="t('common.delete')"
            outlined
        />
        <ConfirmDialog ref="deleteConfirm"></ConfirmDialog>
      </div>
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import { onBeforeMount, ref, watch } from "vue";
import type { PointOfSaleWithContainersResponse } from "@sudosos/sudosos-client";
import { updatePointOfSaleObject } from "@/utils/validation-schema";
import { schemaToForm } from "@/utils/formUtils";
import { usePointOfSaleStore } from "@/stores/pos.store";
import POSSettingsForm from "@/modules/seller/components/POSSettingsForm.vue";
import { useConfirm } from "primevue/useconfirm";
import router from "@/router";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";
import { isAllowed } from "@/utils/permissionUtils";

const confirm = useConfirm();

const edit = ref(false);
const posStore = usePointOfSaleStore();
const pointOfSale = ref<PointOfSaleWithContainersResponse>();

const props = defineProps({
  posId: {
    type: Number,
    required: true
  }
});

const form = schemaToForm(updatePointOfSaleObject);

const formSubmit = async () => {
  await form.submit();
};
const updateFieldValues = (p: PointOfSaleWithContainersResponse) => {
  if (!p) return;

  const name = p.name;
  const useAuthentication = p.useAuthentication;
  const containers = p.containers.map(c => c.id);
  const id = p.id;
  const cashierRoleIds = p.cashierRoles.map(c => c.id);

  form.context.resetForm({ values: { name, useAuthentication, id, cashierRoleIds, containers } });
};

const { t } = useI18n();
const toast = useToast();

const deleteConfirm = ref<HTMLElement | undefined>();
function handleDelete() {
  confirm.require({
    message: t('modules.seller.singlePos.confirmDelete'),
    target: deleteConfirm.value,
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.close'),
    acceptIcon: 'pi pi-trash',
    rejectIcon: 'pi pi-times',
    accept: async () => {
      await posStore.deletePointOfSale(props.posId)
          .catch((err) => {
            handleError(err, toast);
          });
      router.push({ name: 'pointOfSale' });
      toast.add({
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.pointOfSaleDeleted'),
        severity: 'success',
        life: 3000
      });
    }
  });
}

watch(() => pointOfSale.value, (newValue) => {
  updateFieldValues(newValue!!);
});

onBeforeMount(async () => {
  pointOfSale.value = await posStore.getPointOfSale(props.posId);
  if (pointOfSale.value) {
    updateFieldValues(pointOfSale.value);
  }
});

</script>

<style scoped lang="scss">

</style>
