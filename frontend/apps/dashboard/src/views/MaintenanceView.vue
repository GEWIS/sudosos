<template>
  <div class="bg-primary flex flex-column h-screen">
    <main
      class="align-items-center flex flex-column flex-grow h-full justify-content-center max-w-30rem mx-auto my-7 text-center"
    >
      <img alt="logo" class="block max-h-9rem mb-5 mx-auto" src="../assets/img/bier_grayscale.png" />
      <div v-if="isError" class="font-bold text-3xl text-center text-white">
        {{ t('modules.auth.maintenance.unavailable') }}
      </div>
      <div v-else class="font-bold text-3xl text-center text-white">
        {{ t('modules.auth.maintenance.maintenance') }}
      </div>
      <div class="text-2xl text-center text-white">{{ t('modules.auth.maintenance.tryAgain') }}</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { useSettingsStore } from '@/stores/settings.store';

const { t } = useI18n();

const settingsStore = useSettingsStore();
const isError = computed(() => settingsStore.status.maintenanceMode === null);
</script>

<style scoped lang="scss"></style>
