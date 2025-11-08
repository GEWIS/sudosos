<template>
  <TransactionUserBaseForm
    :current-user="transaction.from as UserResponse"
    :edit="edit"
    :form="form"
    @user-selected="$emit('user-selected', $event)"
  />
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import type { TransactionResponse, UserResponse } from '@sudosos/sudosos-client';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';
import TransactionUserBaseForm from './TransactionUserBaseForm.vue';
import { type Form, setSubmit } from '@/utils/formUtils';
import { updateTransactionUserObject } from '@/utils/validation-schema';
import { useTransactionStore } from '@/stores/transaction.store';
import { handleError } from '@/utils/errorUtils';
import { transactionResponseToRequest } from '@/utils/transactionUtil';
import apiService from '@/services/ApiService';

const { t } = useI18n();
const toast = useToast();
const transactionStore = useTransactionStore();

const props = defineProps({
  transaction: {
    type: Object as PropType<TransactionResponse>,
    required: true,
  },
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateTransactionUserObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const emit = defineEmits<{
  'update:edit': [value: boolean];
  'user-selected': [user: UserResponse];
}>();

// Set up the form submission handler
setSubmit(props.form, async () => {
  const values = props.form.context.values;
  if (!props.form.context.meta.value.dirty) {
    emit('update:edit', false);
    return;
  }

  try {
    // Get the new user from form values
    const newUser = values.newUser as UserResponse;

    if (!newUser) {
      throw new Error(t('modules.admin.transactions.missingUserData'));
    }

    // Reconstruct the full transaction request
    const fullTransactionRequest = transactionResponseToRequest(props.transaction);

    // Update only the 'from' field with the new user ID
    fullTransactionRequest.from = newUser.id;

    // Submit the complete transaction
    await transactionStore
      .updateTransaction(props.transaction.id, fullTransactionRequest, apiService)
      .then(() => {
        toast.add({
          severity: 'success',
          summary: t('common.toast.success.success'),
          detail: t('modules.admin.transactions.userUpdated'),
          life: 3000,
        });
        emit('update:edit', false);
      })
      .catch((err) => {
        handleError(err, toast);
      });
  } catch (err) {
    console.error(err);
  }
});
</script>
