<template>
  <Dialog
    :header="t('modules.admin.transactions.confirmEdit')"
    modal
    :style="{ width: '25rem' }"
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex flex-col gap-4">
      <div>
        <p class="mb-3">{{ t('modules.admin.transactions.confirmEditMessage') }}</p>

        <div class="flex flex-col gap-2">
          <div class="flex flex-row gap-2">
            <span class="font-semibold">{{ t('modules.admin.transactions.currentUser') }}:</span>
            <UserLink :new-tab="true" :user="oldUser" />
          </div>
          <div class="flex flex-row gap-2">
            <span class="font-semibold">{{ t('modules.admin.transactions.newUser') }}:</span>
            <UserLink :new-tab="true" :user="newUser" />
          </div>
          <div class="flex flex-row gap-2">
            <span class="font-semibold">{{ t('common.id') }}:</span>
            <span>{{ transactionId }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2">
        <Button :label="t('common.cancel')" severity="secondary" @click="handleCancel" />
        <Button :label="t('common.confirm')" @click="handleConfirm" />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import type { UserResponse } from '@sudosos/sudosos-client';
import UserLink from '@/components/UserLink.vue';

const { t } = useI18n();

defineProps<{
  visible: boolean;
  oldUser: UserResponse;
  newUser: UserResponse;
  transactionId: number;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  confirm: [];
  cancel: [];
}>();

function handleConfirm() {
  emit('confirm');
  emit('update:visible', false);
}

function handleCancel() {
  emit('cancel');
  emit('update:visible', false);
}
</script>
