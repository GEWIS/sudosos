<template>
  <span class="tosLink" @click="visible = true">{{ t('components.footer.termsOfService') }}</span>
  <Dialog v-model:visible="visible" class="tosModal" :draggable="false" modal>
    <template #header>
      {{ t('components.general.termsOfService.header', { version: tosStore.version, date: tosStore.date }) }}
    </template>
    <div>
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
import { computed, ref } from 'vue';
import { marked } from 'marked';
import { useI18n } from 'vue-i18n';
import { useTermsOfServiceStore } from '@/stores/termsOfService.store';

const tosStore = useTermsOfServiceStore();

const { t } = useI18n();
const tos = computed(() => marked(tosStore.getTermsOfService));
const visible = ref(false);
</script>
<style>
.tosLink {
  display: inline-block;
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
