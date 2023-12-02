<template>
    <span class="tosLink" @click="visible = true">{{$t('termsOfService.termsOfService')}}</span>
    <Dialog 
        modal 
        v-model:visible="visible" 
        :draggable="false"
        class="tosModal"
        >
        <template #header>
           {{ $t('termsOfService.termsOfService') }}
        </template>
        <div>
             <p>SudoSOS Terms of Service - version 1.0 (14/08/2022)</p> <!-- TOS is also english so we can leave this untranslated -->
            <div v-html="tos"></div>
        </div>
        <template #footer>
            <Button label="Ok" severity="danger" @click="visible = false" autofocus />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import type { Ref } from 'vue';
import { ref } from 'vue';
import termsOfService from '@/locales/termsOfService.md?raw';
import { marked } from 'marked';


const tos = marked(termsOfService)
const visible = ref(false);
</script>
<style>

.tosLink {
  color: red;
}

.tosLink:hover {
  cursor: pointer;
  text-decoration-line: underline;
}

.tosModal {
    max-width: 75vw
}

</style>
