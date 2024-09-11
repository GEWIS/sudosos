<template>
  <footer>
    <span @click="showVersion = !showVersion" class="copyright">
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
import FooterTermsOfServiceModal from '@/components/footer/FooterTermsOfServiceModal.vue';
import FooterContactModal from '@/components/footer/FooterContactModal.vue';
import { computed, ref } from 'vue';
import { useI18n } from "vue-i18n";

const branch: string | undefined =  import.meta.env.VITE_GIT_COMMIT_BRANCH;
const commit: string | undefined =  import.meta.env.VITE_GIT_COMMIT_SHA;
const showVersion = ref(false);
const { t } = useI18n();

const localBuild = computed (() => {
  if (typeof branch !== 'string' || branch.length === 0) return true;
  if (typeof commit !== 'string' || commit.length === 0) return true;
  return false;
});

</script>

<style scoped>
footer {
  width: 100%;
  padding: 0 1rem;
  height: 60px;
  line-height: 60px;
  background-color: #f5f5f5;
}

b {
  font-weight: bolder;
  color: black;
}

.separator {
  color: black;
  margin: 0 1rem;
}

</style>
