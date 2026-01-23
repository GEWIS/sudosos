<template>
  <footer v-if="isMaintenance && canOverride" class="sticky bottom-0 w-full maintenance-footer-wrapper">
    <div class="w-full h-full flex items-center maintenance-footer overflow-hidden relative">
      <div class="maintenance-marquee">
        <div class="maintenance-marquee-content">
          <span v-for="n in 10" :key="`first-${n}`" class="font-bold text-3xl text-center text-white mx-8">
            <i class="pi pi-exclamation-triangle text-3xl" />
            {{ t('common.maintenanceMode.footer') }}
          </span>
        </div>
        <div class="maintenance-marquee-content">
          <span v-for="n in 10" :key="`second-${n}`" class="font-bold text-3xl text-center text-white mx-8">
            <i class="pi pi-exclamation-triangle text-3xl" />
            {{ t('common.maintenanceMode.footer') }}
          </span>
        </div>
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
  height: fit-content;
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

.maintenance-footer-wrapper {
  z-index: 10;
}

.maintenance-footer {
  background-color: var(--p-primary-color, #d40100);
}

.maintenance-marquee {
  display: flex;
  align-items: center;
  white-space: nowrap;
  animation: maintenance-scroll 20s linear infinite;
  will-change: transform;
}

.maintenance-marquee-content {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

@keyframes maintenance-scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}
</style>
