<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
    <span class="tosLink" @click="visible = true">{{ $t('contact.Contact') }}</span>
    <Dialog modal v-model:visible="visible" :draggable="false" class="tosModal">
        <template #header>
            {{ $t('contact.Contact') }}
        </template>
        <div>
            <b>{{ $t('contact.Main contact') }}:</b><br>
            <a class="text-color" href="mailto:sudosos@gewis.nl">
                sudosos@gewis.nl
            </a> <br><br>

            <b>{{ $t('contact.Incorrect transactions') }}:</b><br>
            <a class="text-color" href="mailto:bacpm@gewis.nl">
                bacpm@gewis.nl
            </a> <br><br>

            <b>{{ $t('contact.Security') }}:</b><br>
            <a class="text-color"
                href="https://gewis.nl/.well-known/security.txt">
                https://gewis.nl/.well-known/security.txt
            </a>
            <br><br>

            <b>{{ $t('contact.Feature requests') }}:</b><br>
            <a class="text-color"
                href="https://github.com/GEWIS/sudosos-backend">
                https://github.com/GEWIS/sudosos-backend
            </a><br>
            <a class="text-color"
                href="https://github.com/GEWIS/sudosos-frontend-vue3">
                https://github.com/GEWIS/sudosos-frontend
            </a><br>
            <a class="text-color"
                href="https://github.com/GEWIS/sudosos-pos-vue3">
                https://github.com/GEWIS/sudosos-pos
            </a><br>

        </div>
        <template #footer>
            <Button label="Ok" @click="visible = false" autofocus />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { ref } from 'vue';

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
