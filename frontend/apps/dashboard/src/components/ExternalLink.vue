<template>
  <a
    class="flex items-center gap-2 cursor-pointer hover:opacity-80 text-primary"
    :href="url"
    rel="noopener noreferrer"
    target="_blank"
  >
    {{ text }}
    <i class="pi pi-external-link text-sm" />
  </a>
</template>

<script setup lang="ts">
interface ExternalLinkProps {
  text: string;
  url: string;
}

const { text, url } = defineProps<ExternalLinkProps>();
</script>

<style scoped lang="scss"></style>
