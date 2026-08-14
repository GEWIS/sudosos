<template>
  <RouterLink v-if="allowed" v-slot="{ href, navigate }" custom :to="to">
    <a
      class="cursor-pointer hover:opacity-80 text-primary"
      :href="href"
      :rel="newTab ? 'noopener noreferrer' : undefined"
      :target="newTab ? '_blank' : undefined"
      @click="navigate"
    >
      {{ text }}
    </a>
  </RouterLink>
  <span v-else>{{ text }}</span>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

/**
 * Props for Link component.
 * @property text - The text to display.
 * @property to - The route to navigate to.
 * @property [allowed=true] - Render as non-clickable text when false.
 * @property [newTab=false] - Open in new tab if true.
 */
interface LinkProps {
  text: string;
  to: RouteLocationRaw;
  allowed?: boolean;
  newTab?: boolean;
}

const { text, to, allowed = true, newTab = false } = defineProps<LinkProps>();
</script>

<style scoped lang="scss"></style>
