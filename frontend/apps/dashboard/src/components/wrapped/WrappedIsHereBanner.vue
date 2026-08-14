<template>
  <div
    v-if="!isDismissed"
    class="w-full flex items-center justify-between gap-4 p-4 rounded-md shadow-sm bg-primary mb-4"
  >
    <div class="flex items-center gap-4">
      <img alt="SudoSOS Logo" class="w-12 h-12" src="../../assets/img/bier.png" />
      <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">{{ t('common.wrapped.banner.title') }}</h1>
    </div>

    <div class="flex items-center gap-2">
      <router-link
        class="inline-flex items-center gap-2 text-primary bg-white text-sm font-medium px-4 py-2 rounded-md"
        :to="{ name: 'wrapped' }"
        @click="dismiss"
      >
        {{ t('common.wrapped.banner.open') }}
      </router-link>
      <button
        aria-label="Dismiss banner"
        class="mx-2 text-sm text-white cursor-pointer"
        type="button"
        @click.prevent="dismiss"
      >
        <i class="pi pi-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const isDismissed = ref(false);

function dismiss() {
  isDismissed.value = true;
  try {
    localStorage.setItem('wrappedBannerDismissed', 'true');
  } catch {
    // ignore
  }
}

if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('wrappedBannerDismissed') === 'true') {
      isDismissed.value = true;
    }
  } catch {
    // ignore
  }
}
</script>
