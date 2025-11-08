<template>
  <FormCard
    v-if="transaction"
    :enable-edit="canEdit"
    :form="form"
    :header="t('modules.admin.transactions.editUser')"
    @cancel="handleCancel"
    @save="handleSave"
    @update:model-value="edit = $event"
  >
    <div class="flex flex-col gap-2 justify-between">
      <TransactionUserUpdateForm
        :edit="edit"
        :form="form"
        :transaction="transaction"
        @update:edit="edit = $event"
        @user-selected="handleUserSelected"
      />
    </div>
  </FormCard>

  <TransactionEditConfirmDialog
    :new-user="selectedNewUser"
    :old-user="transaction?.from as UserResponse"
    :transaction-id="transaction?.id || 0"
    :visible="showConfirmDialog"
    @close="handleCancelConfirm"
    @confirm="handleConfirm"
    @update:visible="showConfirmDialog = $event"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { UserResponse } from '@sudosos/sudosos-client';
import { useTransactionCard } from '../../composables/useTransactionCard';
import { useTransactionForm } from '../../composables/useTransactionForm';
import TransactionUserUpdateForm from './forms/TransactionUserUpdateForm.vue';
import TransactionEditConfirmDialog from './TransactionEditConfirmDialog.vue';
import FormCard from '@/components/FormCard.vue';
import { updateTransactionUserObject } from '@/utils/validation-schema';
import { schemaToForm, getProperty } from '@/utils/formUtils';

const { t } = useI18n();
const props = defineProps<{ transactionId: number }>();

const form = schemaToForm(updateTransactionUserObject);
const { transaction, canEdit, edit } = useTransactionCard(props.transactionId);

useTransactionForm(transaction, form, () => ({
  newUser: undefined,
}));

const showConfirmDialog = ref(false);
const selectedNewUser = ref<UserResponse>(transaction.value.from as UserResponse);

function handleUserSelected(user: UserResponse) {
  selectedNewUser.value = user;
  // Update the form with the new user
  form.context.setFieldValue('newUser', user);
}

function handleSave() {
  const dirty = form.context.meta.value.dirty;
  if (!dirty) {
    edit.value = false;
    return;
  }

  // Get the new user from the form
  const newUser = getProperty(form, 'newUser') as UserResponse | undefined;
  if (!newUser || !transaction.value) return;

  // Show confirmation dialog
  selectedNewUser.value = newUser;
  showConfirmDialog.value = true;
}

async function handleConfirm() {
  // Trigger the form submission
  await form.submit();
  showConfirmDialog.value = false;
}

function handleCancel() {
  // Reset the form back to original state
  form.context.resetForm();
  edit.value = false;
}

function handleCancelConfirm() {
  showConfirmDialog.value = false;
  // Stay in edit mode
}
</script>
