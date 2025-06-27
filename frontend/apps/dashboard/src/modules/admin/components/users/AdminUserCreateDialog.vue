<template>
  <FormDialog
    v-model:model-value="showDialog"
    :form="form"
    :header="t('modules.admin.forms.user.header')"
    :is-editable="true"
  >
    <template #form="slotProps">
      <UserUpsertForm :form="slotProps.form" :pre-typed="preTyped" @submit:success="handleSubmit" />
    </template>
  </FormDialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import type { UserResponse } from '@sudosos/sudosos-client';
import FormDialog from '@/components/FormDialog.vue';
import { schemaToForm } from '@/utils/formUtils';
import { userUpsertSchema } from '@/utils/validation-schema';
import UserUpsertForm from '@/modules/admin/components/users/forms/UserUpsertForm.vue';

const { t } = useI18n();

const form = schemaToForm(userUpsertSchema);
const showDialog = ref(false);

defineProps<{
  preTyped: boolean;
}>();

const emit = defineEmits(['submit']);

const handleSubmit = (u: UserResponse) => {
  emit('submit', u);
};
</script>

<style scoped lang="scss"></style>
