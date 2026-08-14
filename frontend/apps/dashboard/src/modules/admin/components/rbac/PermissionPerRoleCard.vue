<template>
  <CardComponent class="w-full" :header="t('modules.admin.rbac.permissions.title')">
    <template #topAction>
      <Button
        icon="pi pi-plus"
        :label="t('modules.admin.rbac.permissions.addPermission')"
        @click="addPermissionVision = true"
      />
    </template>

    <DataTable :row-class="rowClass" :value="input ? input : null" @row-click="onRowClick">
      <Column field="entity" :header="t('modules.admin.rbac.permissions.title')"> </Column>
      <Column field="icon" :header="t('modules.admin.rbac.permissions.crud')">
        <template #body="slotProps">
          <i
            v-if="slotProps.data.icon == 'all'"
            v-tooltip="t('modules.admin.rbac.permissions.all')"
            class="pi pi-check"
          />
          <i
            v-else-if="slotProps.data.icon == 'partial'"
            v-tooltip="t('modules.admin.rbac.permissions.partial')"
            class="pi pi-chart-pie"
          />
          <i v-else v-tooltip="t('modules.admin.rbac.permissions.none')" class="pi pi-times" />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
  <Dialog
    v-model:visible="addPermissionVision"
    :header="t('modules.admin.rbac.permissions.addPermission')"
    modal
    :style="{ width: '25rem' }"
  >
    <div class="flex flex-col gap-2">
      <InputText v-model="entityToAdd" :placeholder="t('modules.admin.rbac.permissions.entity')"> </InputText>
      <InputText v-model="actionToAdd" :placeholder="t('modules.admin.rbac.permissions.action')"> </InputText>
      <InputText v-model="relationToAdd" :placeholder="t('modules.admin.rbac.permissions.relation')"> </InputText>
      <InputText v-model="attributeToAdd" :placeholder="t('modules.admin.rbac.permissions.attribute')"> </InputText>
    </div>
    <div class="flex flex-row-reverse flex-wrap gap-3 pt-3">
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionConfirmation')"
        type="button"
        @click="handleAddPermissionPush()"
      />
      <Button
        :label="t('modules.admin.rbac.permissions.deletePermissionCancellation')"
        type="button"
        @click="addPermissionVision = false"
      />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { type PropType, ref } from 'vue';
import * as yup from 'yup';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { type Form } from '@/utils/formUtils';
import { rbacSchema } from '@/utils/validation-schema';
import CardComponent from '@/components/CardComponent.vue';
import { usePermissionsUpdating } from '@/composables/usePermissionUpdating';

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof rbacSchema>>>,
    required: true,
  },
});

const addPermissionVision = ref(false);
const entityToAdd = ref('');
const actionToAdd = ref('');
const relationToAdd = ref('');
const attributeToAdd = ref('');
const permissionUpdate = usePermissionsUpdating(
  props.form,
  addPermissionVision,
  entityToAdd,
  actionToAdd,
  relationToAdd,
  attributeToAdd,
);
const input = permissionUpdate.input;
const handleAddPermissionPush = permissionUpdate.handleAddPermissionPush;
const onRowClick = permissionUpdate.onRowClick;

const { t } = useI18n();

const rowClass = () => {
  return ['cursor-pointer', 'hover:bg-black/20'];
};
</script>

<style scoped lang="scss"></style>
