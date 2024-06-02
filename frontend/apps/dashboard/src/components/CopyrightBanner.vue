<template>
  <footer>
    <span class="copyright">
      <b>{{ $t('login.copyright') }}</b>
    </span>
    <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
    <span class="separator"> | </span>
    <TermsOfServiceModal />
    <span class="mx-2"></span>
    <ContactModal />
  </footer>
</template>

<script setup lang="ts">
import TermsOfServiceModal from '@/components/TermsOfServiceModal.vue';
import ContactModal from '@/components/ContactModal.vue';

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
