import { useToast } from 'primevue/usetoast';
import { type Ref, watch } from 'vue';
import type {
  ActionResponse,
  AddRoleRequest,
  CreatePermissionParams,
  RelationResponse,
  UserResponse,
} from '@sudosos/sudosos-client';
import * as yup from 'yup';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import type { Form } from '@/utils/formUtils';
import { rbacSchema } from '@/utils/validation-schema';

export function useRBACUpdating(
  form: Form<yup.InferType<typeof rbacSchema>>,
  permissionVision: Ref<boolean>,
  actionVision: Ref<boolean>,
  deleteUserVision: Ref<boolean>,
  addUserVision: Ref<boolean>,
  actionRelations: Ref<ActionResponse[] | undefined>,
  users: Ref<UserResponse[] | undefined>,
  ownActions: Ref<string[] | undefined>,
  ownRelations: Ref<string[] | undefined>,
  ownAttributes: Ref<string[] | undefined>,
) {
  const toast = useToast();
  watch(
    () => form.context.values.currentPermission,
    () => {
      const allRelations: ActionResponse[] = [];
      form.context.values.currentPermission.actions.forEach((action) => {
        action.relations.forEach((relation) => {
          relation.attributes.forEach((attribute) => {
            const rel = { relation: relation.relation, attributes: [attribute] };
            allRelations.push({ action: action.action, relations: [rel] });
          });
        });
      });
      actionRelations.value = allRelations;
    },
  );

  watch(
    () => form.context.values.users,
    () => {
      if (form.context.values.users) {
        users.value = form.context.values.users;
      }
    },
  );

  watch(
    () => form.context.values.permissions,
    () => {
      const tempActions: Set<string> = new Set();
      const tempRelations: Set<string> = new Set();
      const tempAttributes: Set<string> = new Set();
      if (form.context.values.permissions) {
        form.context.values.permissions.forEach((permission) => {
          permission.actions.forEach((action) => {
            tempActions.add(action.action);
            action.relations.forEach((relation) => {
              tempRelations.add(relation.relation);
              relation.attributes.forEach((attribute) => {
                tempAttributes.add(attribute);
              });
            });
          });
        });
      }
      ownActions.value = Array.from(tempActions);
      ownRelations.value = Array.from(tempRelations);
      ownAttributes.value = Array.from(tempAttributes);
    },
  );

  const handleDeletePermissionPush = (action: string, relation: string, attribute: string) => {
    permissionVision.value = true;
    const relRes: RelationResponse = {
      relation: relation,
      attributes: [attribute],
    };
    const actionRes: ActionResponse = {
      action: action,
      relations: [relRes],
    };
    form.context.setFieldValue('currentAction', actionRes);
  };

  const handleDeletePermissionConfirmation = (entity: string, id: number, action: string, relation: string) => {
    apiService.rbac
      .deletePermission(id, entity, action, relation)
      .then(() => {
        const allRelations: ActionResponse[] = [];
        form.context.values.currentPermission.actions.forEach((action) => {
          action.relations.forEach((relation) => {
            relation.attributes.forEach((attribute) => {
              const rel = { relation: relation.relation, attributes: [attribute] };
              allRelations.push({ action: action.action, relations: [rel] });
            });
          });
        });
        actionRelations.value = allRelations;
        permissionVision.value = false;
      })
      .catch((error) => {
        handleError(error, toast);
      });
  };

  const handleAddActionPush = (entity: string, action: string, relation: string, attribute: string) => {
    const addPermissionReq: CreatePermissionParams = {
      entity: entity,
      action: action,
      relation: relation,
      attributes: [attribute],
    };
    apiService.rbac.addPermissions(form.context.values.role.id, [addPermissionReq]).catch((error) => {
      handleError(error, toast);
    });
    actionVision.value = false;
    if (actionRelations.value) {
      const allRelations = actionRelations.value;
      const rel = { relation: relation, attributes: [attribute] };
      allRelations.push({ action: action, relations: [rel] });
      actionRelations.value = allRelations;
    }
  };

  const handleDeleteUserPush = (user: UserResponse) => {
    deleteUserVision.value = true;
    form.context.setFieldValue('currentUser', user);
  };

  const handleDeleteUserConfirmation = (userId: number, roleId: number) => {
    apiService.user
      .deleteUserRole(userId, roleId)
      .then(() => {
        deleteUserVision.value = false;
        apiService.rbac
          .getRoleUsers(form.context.values.role.id)
          .then((res) => {
            users.value = res.data.records;
            form.context.setFieldValue('users', users.value);
          })
          .catch((err) => {
            handleError(err, toast);
          });
      })
      .catch((err) => handleError(err, toast));
  };

  const handleAddUserPush = (id: number) => {
    const roleRequest: AddRoleRequest = { roleId: form.context.values.role.id };
    apiService.user
      .addUserRole(id, roleRequest)
      .then(() => {
        addUserVision.value = false;
        apiService.rbac
          .getRoleUsers(form.context.values.role.id)
          .then((res) => {
            users.value = res.data.records;
            form.context.setFieldValue('users', users.value);
          })
          .catch((err) => {
            handleError(err, toast);
          });
      })
      .catch((err) => {
        handleError(err, toast);
      });
  };
  return {
    handleDeletePermissionPush,
    handleDeletePermissionConfirmation,
    handleAddActionPush,
    handleDeleteUserPush,
    handleDeleteUserConfirmation,
    handleAddUserPush,
  };
}
