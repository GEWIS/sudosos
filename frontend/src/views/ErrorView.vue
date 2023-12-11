<template>
  <div class="page-container">
    <div class="page-title">{{ t('apiError.error') }}</div>
    <div class="content-wrapper">
      <p class="page-subtitle">{{ t('apiError.500') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped lang="scss">
@import '../styles/BasePage.css';

p {

}
</style>
