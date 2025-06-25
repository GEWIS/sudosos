<template>
  <FormDialog
    v-model:model-value="visible"
    :deletable="state.edit"
    :form="form"
    :header="header"
    :is-editable="state.edit || state.create"
    @close="closeDialog()"
    @delete="() => deleteContainer(props.container!)"
    @show="openDialog()"
  >
    <template #form>
      <ContainerActionsForm
        class="min-w-[20rem]"
        :form="form"
        :is-editable="state.edit || state.create"
        :is-organ-editable="state.create"
      />
      <ConfirmDialog :group="`containerDelete-${props.container?.id}`" />
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  ContainerWithProductsResponse,
  CreateContainerRequest,
  PointOfSaleWithContainersResponse,
  UpdateContainerRequest,
} from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useContainerStore } from '@/stores/container.store';
import { handleError } from '@/utils/errorUtils';
import { schemaToForm, setSubmit } from '@/utils/formUtils';
import { containerActionSchema } from '@/utils/validation-schema';
import ContainerActionsForm from '@/components/container/ContainerActionsForm.vue';
import FormDialog from '@/components/FormDialog.vue';
const { t } = useI18n();

const props = defineProps<{
  container?: ContainerWithProductsResponse;
  associatedPos?: PointOfSaleWithContainersResponse;
  isEditAllowed?: boolean;
}>();

const containerStore = useContainerStore();

const visible = defineModel<boolean>('visible', { required: true });

const toast = useToast();

const state = computed(() => {
  return {
    create: props.container == undefined,
    edit: props.container != undefined && props.isEditAllowed,
  };
});
const header = computed(() => {
  if (state.value.create) return t('modules.seller.productContainers.containers.create');
  if (state.value.edit) return t('modules.seller.productContainers.containers.edit');
  return t('modules.seller.productContainers.containers.view');
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
      public: false,
    },
  });
};

setSubmit(
  form,
  form.context.handleSubmit((values) => {
    if (state.value.create) {
      const createContainerRequest: CreateContainerRequest = {
        name: values.name,
        ownerId: values.owner.id,
        products: [],
        public: values.public,
      };

      containerStore
        .createContainer(createContainerRequest)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.containerCreated'),
            life: 3000,
          });
          closeDialog();
        })
        .catch((err) => handleError(err, toast));
    }

    if (state.value.edit) {
      const updateContainerRequest: UpdateContainerRequest = {
        name: values.name,
        products: props.container!.products.map((p) => p.id),
        public: values.public,
      };

      containerStore
        .updateContainer(props.container!.id, updateContainerRequest)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.containerUpdated'),
            life: 3000,
          });
          closeDialog();
        })
        .catch((err) => handleError(err, toast));
    }
  }),
);

const updateFieldValues = (p: ContainerWithProductsResponse) => {
  if (!p) return;

  form.model.name.value.value = p.name;
  form.model.owner.value.value = p.owner;
  form.model.public.value.value = p.public || false;
};

const confirm = useConfirm();

function deleteContainer(c: ContainerWithProductsResponse) {
  confirm.require({
    header: t('common.delete'),
    message: t('modules.seller.productContainers.containers.confirmDelete'),
    acceptLabel: t('common.delete'),
    rejectLabel: t('common.close'),
    acceptIcon: 'pi pi-trash',
    rejectIcon: 'pi pi-times',
    group: `containerDelete-${c.id}`,
    accept: () => {
      containerStore
        .deleteContainer(c.id)
        .then(() => {
          toast.add({
            summary: t('common.toast.success.success'),
            detail: t('common.toast.success.containerDeleted'),
            severity: 'success',
            life: 3000,
          });
          confirm.close();
          closeDialog();
        })
        .catch((err) => {
          handleError(err, toast);
          confirm.close();
        });
    },
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
