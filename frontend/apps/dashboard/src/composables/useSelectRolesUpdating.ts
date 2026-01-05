import * as yup from 'yup';
import { ref } from 'vue';
import type { PermissionResponse, RoleResponse, UserResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import type { Form } from '@/utils/formUtils';
import { rbacSchema } from '@/utils/validation-schema';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';

export function useSelectRolesUpdating(form: Form<yup.InferType<typeof rbacSchema>>) {
  const currentPermissions = ref<PermissionResponse[]>();
  const currentUsers = ref<UserResponse[]>();

  const updateRole = (event: RoleResponse) => {
    form.context.setFieldValue('role', event);
    fetchPermissions(event.id);
    updateUsers(event.id);
  };

  function fetchPermissions(id: number) {
    apiService.rbac
      .getSingleRole(id)
      .then((response) => {
        if (response.data.permissions[0]) {
          currentPermissions.value = response.data.permissions;
          form.context.setFieldValue('permissions', currentPermissions.value);
          form.context.setFieldValue('currentPermission', response.data.permissions[0]);
        }
      })
      .catch(() => {
        currentPermissions.value = [];
      });
  }

  function updateUsers(id: number) {
    let systemDefault = false;
    apiService.rbac
      .getSingleRole(id)
      .then((res) => {
        systemDefault = res.data.systemDefault;
      })
      .catch((err) => {
        handleError(err, useToast());
      });
    if (!systemDefault) {
      apiService.rbac
        .getRoleUsers(id)
        .then((res) => {
          currentUsers.value = res.data.records;
          form.context.setFieldValue('users', currentUsers.value);
        })
        .catch((err) => {
          handleError(err, useToast());
        });
    } else {
      currentUsers.value = [];
      form.context.setFieldValue('users', currentUsers.value);
    }
  }
  return {
    updateRole,
  };
}
