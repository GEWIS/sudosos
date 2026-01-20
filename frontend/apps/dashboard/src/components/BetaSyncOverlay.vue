<template>
  <div
    v-if="visible"
    class="fixed top-0 left-0 w-full h-full flex text-white justify-center items-center z-[9999] bg-red bg-opacity-75"
  >
    <main class="flex flex-col items-center gap-4">
      <ProgressSpinner />
      <div class="font-bold text-xl text-center">{{ t('common.betaSync.redirecting') }}</div>
      <div class="text-lg text-center">{{ t('common.betaSync.message') }}</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ProgressSpinner from 'primevue/progressspinner';

defineProps<{
  visible: boolean;
}>();

const { t } = useI18n();
</script>

<style scoped lang="scss">
.bg-red {
  background: var(--p-primary-color);
}
</style>
