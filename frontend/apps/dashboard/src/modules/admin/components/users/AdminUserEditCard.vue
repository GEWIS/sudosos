<template>
  <FormCard
    :enable-edit="canEdit"
    :form="form"
    :header="t('modules.admin.singleUser.userInfo.header')"
    @save="() => form.submit()"
    @update:model-value="edit = $event"
  >
    <UserUpsertForm :disabled="!edit" :form="form" :pre-typed="true" @submit:success="setUser" />
    <div v-if="showDelete" class="items-end flex flex-col mt-3">
      <ConfirmButton
        :disabled="!edit"
        icon="pi pi-trash"
        :initial-label="t('common.delete')"
        type="submit"
        @confirm="deleteUser"
      />
    </div>
  </FormCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { UserResponse } from '@sudosos/sudosos-client';
import { computed, ref, watch } from 'vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { schemaToForm } from '@/utils/formUtils';
import { USER_TYPES, userUpsertSchema } from '@/utils/validation-schema';
import UserUpsertForm from '@/modules/admin/components/users/forms/UserUpsertForm.vue';
import FormCard from '@/components/FormCard.vue';
import ConfirmButton from '@/components/ConfirmButton.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import { isAllowed } from '@/utils/permissionUtils';

const { t } = useI18n();
const form = schemaToForm(userUpsertSchema);
const toast = useToast();

const props = defineProps<{
  user: UserResponse | undefined;
}>();

const edit = ref(false);

const canEdit = isAllowed('update', ['all'], 'User', ['*']);

const showDelete = computed(() => {
  if (!isAllowed('delete', ['all'], 'User', ['*'])) return false;
  if (!props.user) return false;
  return [USER_TYPES.LOCAL_USER, USER_TYPES.LOCAL_ADMIN, USER_TYPES.INVOICE, USER_TYPES.AUTOMATIC_INVOICE].includes(
    props.user.type as USER_TYPES,
  );
});

const setUser = (user: UserResponse) => {
  const values = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    nickname: user.nickname,
    userType: user.type as USER_TYPES,
    isActive: user.active,
    ofAge: user.ofAge,
    canGoIntoDebt: user.canGoIntoDebt,
  };
  form.context.resetForm({ values });
};

watch(
  () => props.user,
  (user) => {
    if (user) setUser(user);
  },
  { immediate: true },
);

const userStore = useUserStore();
const router = useRouter();

const deleteUser = async () => {
  if (!props.user) return;
  await userStore
    .removeUser(props.user.id, apiService)
    .then(async () => {
      toast.add({
        severity: 'success',
        summary: t('common.toast.success.success'),
        detail: t('common.toast.success.userDeleted'),
        life: 3000,
      });
      await router.push({ name: 'users' });
    })
    .catch((err) => {
      handleError(err, toast);
    });
};
</script>

<style scoped lang="scss"></style>
