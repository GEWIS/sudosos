<template>
  <CardComponent class="w-full" :header="t('modules.admin.rbac.selection.title')">
    <InputRoleSpan
      v-model:value="selectedRole"
      class="mb-3"
      :label="t('modules.admin.rbac.selection.label')"
      :placeholder="t('modules.admin.rbac.selection.title')"
      @update:value="updateRole($event)"
    />
  </CardComponent>
</template>

<script setup lang="ts">
import type { RoleResponse } from '@sudosos/sudosos-client';
import { ref, type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import CardComponent from '@/components/CardComponent.vue';
import InputRoleSpan from '@/components/InputRoleSpan.vue';
import { rbacSchema } from '@/utils/validation-schema';
import { type Form } from '@/utils/formUtils';
import { useSelectRolesUpdating } from '@/composables/useSelectRolesUpdating';

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof rbacSchema>>>,
    required: true,
  },
});

const { t } = useI18n();

const selectedRole = ref<RoleResponse | undefined>(undefined);
const selectRoles = useSelectRolesUpdating(props.form);
const updateRole = selectRoles.updateRole;
</script>

<style scoped lang="scss"></style>
