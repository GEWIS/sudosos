<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <span class="tosLink" @click="visible = true">{{ t('components.footer.contact') }}</span>
  <Dialog v-model:visible="visible" class="tosModal" :draggable="false" modal>
    <template #header>
      {{ t('components.footer.contact') }}
    </template>
    <div>
      <b>{{ t('components.footer.financialMatters') }}:</b><br />
      <a class="text-color underline" href="mailto:bacpm@gewis.nl"> bacpm@gewis.nl </a> <br /><br />

      <b>{{ t('components.footer.security') }}:</b><br />
      <a class="text-color underline" href="https://gewis.nl/.well-known/security.txt">
        https://gewis.nl/.well-known/security.txt
      </a>
      <br /><br />

      <b>{{ t('components.footer.codeBugsFeatureRequests') }}:</b><br />
      <a class="text-color underline" href="https://github.com/GEWIS/sudosos"> https://github.com/GEWIS/sudosos </a
      ><br />
    </div>
    <template #footer>
      <Button autofocus label="Ok" @click="visible = false" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const visible = ref(false);
const { t } = useI18n();
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
</style>
