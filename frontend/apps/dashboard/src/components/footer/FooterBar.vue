<template>
  <footer>
    <span @click="showVersion = !showVersion" class="copyright">
      <b>{{ showVersion ? `${branch}#${commit}` : $t('login.copyright') }}</b> 
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
import { ref } from 'vue';

const branch = __GIT_BRANCH__;
const commit = __GIT_COMMIT__;

const showVersion = ref(false);
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
