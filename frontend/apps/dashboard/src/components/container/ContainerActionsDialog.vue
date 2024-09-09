<template>
  <FormDialog
   v-model:model-value="visible"
   :form="form"
   :header="header"
   @show="openDialog()"
   @close="closeDialog()"
   @delete="deleteProduct()"
   :deletable="state.edit"
  >
    <template #form>
      <ContainerActionsForm
          :is-organ-editable="state.create"
          :form="form"/>
      <ConfirmDialog group="containerDelete"/>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { computed, type PropType } from "vue";
import type {
  ContainerWithProductsResponse,
  CreateContainerRequest,
  PointOfSaleWithContainersResponse,
  UpdateContainerRequest
} from "@sudosos/sudosos-client";
import { useContainerStore } from "@/stores/container.store";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { schemaToForm, setSubmit } from "@/utils/formUtils";
import { containerActionSchema  } from "@/utils/validation-schema";
import ContainerActionsForm from "@/components/container/ContainerActionsForm.vue";
import FormDialog from "@/components/FormDialog.vue";
import { useConfirm } from "primevue/useconfirm";
const { t } = useI18n();

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
    required: false,
  },
  associatedPos: {
    type: Object as PropType<PointOfSaleWithContainersResponse>,
    required: false
  }
});

const containerStore = useContainerStore();

const visible = defineModel<boolean>('visible', { required: true });

const toast = useToast();

const state = computed(() => {
  return {
    create: props.container == undefined,
    edit: props.container != undefined,
  };
});
const header = computed(() => {
  if (state.value.create) return t('c_containerEditModal.header.create');
  if (state.value.edit) return t('c_containerEditModal.header.edit');
  return '';
});

const form = schemaToForm(containerActionSchema);

const openDialog = () => {
  if (props.container) updateFieldValues(props.container);
};

const closeDialog = () => {
  visible.value = false;
  form.context.resetForm({
    values: {
      name: '',
      owner: undefined,
      public: false
    }
  });
};

setSubmit(form, form.context.handleSubmit(async (values) => {
  if(state.value.create) {
    const createContainerRequest: CreateContainerRequest = {
      name: values.name,
      ownerId: values.owner.id,
      products: [],
      public: values.public
    };

    await containerStore.createContainer(createContainerRequest)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('successMessages.success'),
            detail: t('successMessages.createContainer'),
            life: 3000,
          });
        })
        .catch((err) => handleError(err, toast));
  }

  if(state.value.edit) {
    const updateContainerRequest: UpdateContainerRequest = {
      name: values.name,
      products: props.container!.products.map(p => p.id),
      public: values.public
    };

    await containerStore.updateContainer(props.container!.id, updateContainerRequest)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('successMessages.success'),
            detail: t('successMessages.updateContainer'),
            life: 3000,
          });
          closeDialog();
        })
        .catch((err) => handleError(err, toast));
  }
}));

const updateFieldValues = (p: ContainerWithProductsResponse) => {
  if (!p) return;

  form.model.name.value.value = p.name;
  form.model.owner.value.value = p.owner;
  form.model.public.value.value = p.public || false;
};

const confirm = useConfirm();

async function deleteProduct() {
  if(props.container == undefined) return;
  confirm.require({
    message: t('c_containerEditModal.confirmDelete'),
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.close'),
    acceptIcon: 'pi pi-trash',
    rejectIcon: 'pi pi-times',
    group: 'containerDelete',
    accept: async () => {
      await containerStore.deleteContainer(props.container!.id)
          .then(() => {
            toast.add({
              summary: t('successMessages.success'),
              detail: t('successMessages.containerDeleted'),
              severity: 'success',
              life: 3000
            });
            confirm.close();
            closeDialog();
          })
          .catch((err) => {
            handleError(err, toast);
            confirm.close();
            closeDialog();
          });
    }
  });

}

</script>

<style scoped lang="scss">
.error-text {
  position: absolute;
  bottom: -1.5rem;
  left: 0;
  color: red;
  font-size: 0.875rem;
  text-align: right;
  width: 100%;
}
</style>
