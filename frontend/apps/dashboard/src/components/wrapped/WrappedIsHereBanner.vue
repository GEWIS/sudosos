<template>
  <div v-if="!isDismissed" class="banner relative overflow-hidden w-full rounded-xl shadow-md mb-4 text-white">
    <WrappedShapes active :variant="isLg ? 'banner' : 'bannerNarrow'" />
    <div class="content relative flex flex-wrap items-center justify-between gap-4 px-6 py-5">
      <router-link class="flex flex-col no-underline text-white" :to="{ name: 'wrapped' }" @click="dismiss">
        <i18n-t
          class="text-3xl font-black leading-tight"
          keypath="common.wrapped.banner.title"
          scope="global"
          tag="span"
        >
          <template #year>
            <span class="year">{{ year }}</span>
          </template>
        </i18n-t>
      </router-link>

      <div class="flex items-center gap-2">
        <router-link
          class="open inline-flex items-center gap-2 bg-white text-sm font-bold px-5 py-2.5 rounded-full"
          :to="{ name: 'wrapped' }"
          @click="dismiss"
        >
          {{ t('common.wrapped.banner.open') }}
          <i class="pi pi-arrow-right"></i>
        </router-link>
        <button
          :aria-label="t('common.close')"
          class="mx-2 text-sm text-white cursor-pointer"
          type="button"
          @click.prevent="dismiss"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import WrappedShapes from '@/components/wrapped/WrappedShapes.vue';
import { useSizeBreakpoints } from '@/composables/sizeBreakpoints';

const { t } = useI18n();
// Below about this width the button wraps under the title.
const { isLg } = useSizeBreakpoints();

// Wrapped looks back on the current year, or in January on the year before, like the backend.
// A dismissal lasts until the next Wrapped.
const now = new Date();
const year = String(now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());

const isDismissed = ref(false);

function dismiss() {
  isDismissed.value = true;
  try {
    localStorage.setItem('wrappedBannerDismissed', year);
  } catch {
    // ignore
  }
}

if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('wrappedBannerDismissed') === year) {
      isDismissed.value = true;
    }
  } catch {
    // ignore
  }
}
</script>

<style scoped>
.banner {
  background: linear-gradient(120deg, #b40000 0%, #6d0019 55%, #2a0a3d 100%);
}

.year {
  color: #cdf564;
}

.open {
  color: #b40000;
}
</style>
