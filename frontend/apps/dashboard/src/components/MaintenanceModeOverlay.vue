<template>
  <div
    v-if="isMaintenance && !canOverride"
    class="absolute top-0 left-0 w-full h-full flex text-white justify-center items-center z-10 bg-red-700"
  >
    <main>
      <img alt="logo" class="block mx-auto mb-5 max-h-[25rem]" src="@/assets/img/bier_grayscale.png" />
      <div class="font-bold text-3xl text-center">{{ t('common.maintenanceMode.title') }}</div>
      <div class="text-2xl text-center">{{ t('common.maintenanceMode.subtitle') }}</div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useIsMaintenance } from '@/composables/isMaintenance';

const { t } = useI18n();
const router = useRouter();
const { isMaintenance, canOverride } = useIsMaintenance();

watch(
  () => isMaintenance.value,
  () => {
    // Force logout when the maintenance mode is enabled
    if (isMaintenance.value && !canOverride.value) {
      useAuthStore().logout();
      void router.push({ name: 'login' });
    }
  },
);
</script>

<style scoped lang="scss"></style>
