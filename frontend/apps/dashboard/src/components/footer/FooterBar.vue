<template>
  <footer v-if="isMaintenance && canOverride" class="sticky bottom-0 w-full">
    <div class="w-full h-full flex justify-center items-center bg-red-700 overflow-hidden relative">
      <div class="maintenance-marquee">
        <span v-for="n in 10" :key="n" class="font-bold text-3xl text-center text-white mx-8">
          <i class="pi pi-exclamation-triangle text-3xl" />
          {{ t('common.maintenanceMode.footer') }}
        </span>
      </div>
    </div>
  </footer>
  <footer v-else>
    <span class="copyright" @click="showVersion = !showVersion">
      <b v-if="!showVersion">{{ t('components.footer.copyright') }}</b>
      <b v-else>{{ localBuild ? t('components.footer.localBuild') : `${branch}#${commit}` }}</b>
    </span>
    <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
    <span class="separator"> | </span>
    <FooterTermsOfServiceModal />
    <span class="mx-2"></span>
    <FooterContactModal />
  </footer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import FooterTermsOfServiceModal from '@/components/footer/FooterTermsOfServiceModal.vue';
import FooterContactModal from '@/components/footer/FooterContactModal.vue';
import { useIsMaintenance } from '@/composables/isMaintenance';

const branch: string | undefined = import.meta.env.VITE_GIT_COMMIT_BRANCH;
const commit: string | undefined = import.meta.env.VITE_GIT_COMMIT_SHA;
const showVersion = ref(false);
const { t } = useI18n();

const localBuild = computed(() => {
  if (typeof branch !== 'string' || branch.length === 0) return true;
  if (typeof commit !== 'string' || commit.length === 0) return true;
  return false;
});

const { isMaintenance, canOverride } = useIsMaintenance();
</script>

<style scoped>
footer {
  width: 100%;
  padding: 0 1rem;
  height: 60px;
  line-height: 60px;
  background-color: var(--p-content-background);
}

b {
  font-weight: bolder;
  color: var(--p-content-color);
}

.separator {
  color: var(--p-content-color);
  margin: 0 1rem;
}

.maintenance-marquee {
  display: flex;
  align-items: center;
  min-width: 200%;
  white-space: nowrap;
  animation: maintenance-scroll 15s linear infinite;
}

@keyframes maintenance-scroll {
  0% {
    transform: translateX(0%);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
