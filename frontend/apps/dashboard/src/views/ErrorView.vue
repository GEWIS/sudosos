<template>
  <PageContainer>
    <div class="text-4xl mb-4">{{ t('common.apiError') }}</div>
    <div class="flex flex-col">
      <!-- eslint-disable-next-line vue/no-v-html -->
      <p v-html="errorMessage"></p>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import PageContainer from '@/layout/PageContainer.vue';

const { t } = useI18n();

const errorMessage = computed(() => {
  const linkHtml = `<a class="underline" href="https://github.com/gewis/sudosos-frontend/issues/new/choose" target="_blank">GitHub</a>`;
  return t('common.errorMessage', { link: linkHtml });
});
</script>

<style scoped lang="scss"></style>
