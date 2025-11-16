<template>
  <span class="tosLink" @click="visible = true">{{ t('components.footer.termsOfService') }}</span>
  <Dialog v-model:visible="visible" class="tosModal" :draggable="false" modal>
    <template #header>
      {{ t('components.footer.termsOfService') }}
    </template>
    <div>
      <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
      <p>SudoSOS Terms of Service - version 1.0 (14/08/2022)</p>
      <!-- TOS is also english so we can leave this untranslated -->
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="tosText prose" v-html="tos"></div>
    </div>
    <template #footer>
      <Button autofocus label="Ok" @click="visible = false" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import { marked } from 'marked';
import { useI18n } from 'vue-i18n';
import termsOfService from '@/locales/termsOfService.md?raw';

const { t } = useI18n();
const tos = marked(termsOfService);
const visible = ref(false);
</script>
<style>
.tosLink {
  color: var(--p-primary-color);
}

.tosLink:hover {
  cursor: pointer;
  text-decoration-line: underline;
}

.tosModal {
  max-width: 75vw;
}

.tosText.prose {
  color: var(--text-color-contrast) !important;
}

.tosText.prose :is(h1, h2, h3, h4, h5, h6) {
  color: var(--text-color-contrast) !important;
}

.tosText.prose :is(b, strong) {
  color: var(--text-color-contrast) !important;
}

.tosText.prose :is(a) {
  color: var(--p-primary-color) !important;
}
</style>
