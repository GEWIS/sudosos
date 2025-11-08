<template>
  <div class="flex flex-col gap-2">
    <div v-if="!edit" class="flex flex-row gap-2">
      <span class="font-semibold">{{ t('common.for') }}:</span>
      <UserLink :new-tab="true" :user="currentUser" />
    </div>
    <div v-else class="flex flex-col gap-2">
      <label class="font-semibold">{{ t('modules.admin.transactions.newUser') }}:</label>
      <FindUser
        v-model:user="selectedUser as UserResponse"
        :placeholder="t('modules.admin.transactions.selectUser')"
        @update:user="updateFormValue"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { UserResponse, BaseUserResponse } from '@sudosos/sudosos-client';
import * as yup from 'yup';
import FindUser from '@/components/FindUser.vue';
import UserLink from '@/components/UserLink.vue';
import { type Form, getProperty } from '@/utils/formUtils';
import { updateTransactionUserObject } from '@/utils/validation-schema';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof updateTransactionUserObject>>>,
    required: true,
  },
  edit: {
    type: Boolean,
    required: true,
  },
  currentUser: {
    type: Object as PropType<UserResponse>,
    required: true,
  },
});

const emit = defineEmits<{
  'user-selected': [user: UserResponse];
}>();

const selectedUser = ref<BaseUserResponse | null>(null);

// Watch for form changes to update selected user
watch(
  () => getProperty(props.form, 'newUser'),
  (newUser) => {
    if (newUser && typeof newUser === 'object' && 'id' in newUser && selectedUser.value?.id !== newUser.id) {
      selectedUser.value = newUser as BaseUserResponse;
    }
  },
  { immediate: true },
);

function updateFormValue(user: BaseUserResponse | null) {
  if (user) {
    props.form.context.setFieldValue('newUser', user);
    selectedUser.value = user;
    // Emit the user as UserResponse (BaseUserResponse is compatible)
    emit('user-selected', user as UserResponse);
  }
}
</script>
