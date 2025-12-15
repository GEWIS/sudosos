<template>
  <div class="flex flex-row gap-2 items-center justify-between">
    <span> {{ t('modules.admin.wrapped.wrappedMode') }} </span>
    <ConfirmButton
      class="min-w-[220px]"
      :confirm-label="
        t('modules.admin.wrapped.confirm.confirm', {
          enabled: isWrapped ? t('modules.admin.wrapped.confirm.off') : t('modules.admin.wrapped.confirm.on'),
        })
      "
      icon="pi pi-exclamation-triangle"
      :initial-label="
        t('modules.admin.wrapped.confirm.initial', {
          enabled: isWrapped ? t('modules.admin.wrapped.confirm.enabled') : t('modules.admin.wrapped.confirm.disabled'),
        })
      "
      type="submit"
      @confirm="toggleWrapped"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useIsWrapped } from '@/composables/isWrapped';
import ConfirmButton from '@/components/ConfirmButton.vue';
import apiService from '@/services/ApiService';

const { isWrapped, fetchWrappedState } = useIsWrapped();
const { t } = useI18n();

const toggleWrapped = async () => {
  const newValue = !isWrapped.value;
  isWrapped.value = newValue;
  try {
    await apiService.serverSettings.setWrappedEnabled({ enabled: newValue });
  } catch (error) {
    await fetchWrappedState();
    throw error;
  }
};
</script>

<style scoped lang="scss"></style>
