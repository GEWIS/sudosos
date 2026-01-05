import { computed, type Ref } from 'vue';
import type { ActionResponse, CreatePermissionParams, PermissionResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import * as yup from 'yup';
import type { DataTableRowClickEvent } from 'primevue/datatable';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import { type Form, getProperty } from '@/utils/formUtils';
import { rbacSchema } from '@/utils/validation-schema';

export function usePermissionsUpdating(
  form: Form<yup.InferType<typeof rbacSchema>>,
  addPermissionVision: Ref<boolean>,
  entityToAdd: Ref<string>,
  actionToAdd: Ref<string>,
  relationToAdd: Ref<string>,
  attributeToAdd: Ref<string>,
) {
  const toast = useToast();

  const permissions = computed(() => {
    return getProperty(form, 'permissions');
  });

  const input = computed(() => {
    if (permissions.value) {
      const permissionsResponse: PermissionResponse[] = permissions.value;
      const icons: { [id: string]: string } = {};
      permissionsResponse.forEach((permission) => {
        const filteredData = permission.actions.filter(isCrud);
        if (filteredData.length === 4) {
          icons[permission.entity] = 'all';
        } else if (filteredData.length > 0) {
          icons[permission.entity] = 'partial';
        } else {
          icons[permission.entity] = 'none';
        }
      });
      return permissionsResponse.map((permission) => {
        return {
          ...permission,
          icon: icons[permission.entity],
        };
      });
    } else {
      return [];
    }
  });

  const onRowClick = (data: DataTableRowClickEvent<PermissionResponse>) => {
    const permission: PermissionResponse = {
      entity: data.data.entity,
      actions: data.data.actions,
    };
    form.context.setFieldValue('currentPermission', permission);
  };

  function isCrud(action: ActionResponse) {
    return (
      action.action === 'create' || action.action === 'delete' || action.action === 'get' || action.action === 'update'
    );
  }

  const handleAddPermissionPush = () => {
    const newPermission: CreatePermissionParams = {
      entity: entityToAdd.value,
      action: actionToAdd.value,
      relation: relationToAdd.value,
      attributes: [attributeToAdd.value],
    };
    apiService.rbac
      .addPermissions(form.context.values.role.id, [newPermission])
      .then(() => {
        addPermissionVision.value = false;
        location.reload();
      })
      .catch((error) => {
        handleError(error, toast);
      });
  };

  return {
    input,
    onRowClick,
    handleAddPermissionPush,
  };
}
