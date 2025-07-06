<template>
  <div class="flex flex-row gap-2 items-center justify-between">
    <span> {{ t('modules.admin.maintenance.maintenanceMode') }} </span>
    <ConfirmButton
      class="min-w-[220px]"
      :confirm-label="
        t('modules.admin.maintenance.confirm.confirm', {
          enabled: isMaintenance
            ? t('modules.admin.maintenance.confirm.off')
            : t('modules.admin.maintenance.confirm.on'),
        })
      "
      icon="pi pi-exclamation-triangle"
      :initial-label="
        t('modules.admin.maintenance.confirm.initial', {
          enabled: isMaintenance
            ? t('modules.admin.maintenance.confirm.enabled')
            : t('modules.admin.maintenance.confirm.disabled'),
        })
      "
      type="submit"
      @confirm="toggleMaintenance"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useIsMaintenance } from '@/composables/isMaintenance';
import ConfirmButton from '@/components/ConfirmButton.vue';
import apiService from '@/services/ApiService';

const { isMaintenance } = useIsMaintenance();
const { t } = useI18n();

const toggleMaintenance = async () => {
  await apiService.serverSettings.setMaintenanceMode({
    enabled: !isMaintenance.value,
  });
};
</script>

<style scoped lang="scss"></style>
