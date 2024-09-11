<template>
  <div class="page-container">
    <div class="page-title">{{ t('common.apiError') }}</div>
    <div class="content-wrapper">
      <p class="page-subtitle" v-html="errorMessage"></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from "vue";

const { t } = useI18n();

const errorMessage = computed(() => {
  const linkHtml =
    `<a href="https://github.com/gewis/sudosos-frontend-vue3/issues/new/choose" target="_blank">GitHub</a>`;
  return t('common.errorMessage', { link: linkHtml });
});

</script>

<style scoped lang="scss">
</style>
