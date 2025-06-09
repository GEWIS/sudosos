<template>
  <span class="flex flex-row flex-wrap gap-3 justify-between">
    <p class="my-0">{{ label }}</p>
    <p class="my-0">{{ value }}</p>
  </span>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});
</script>

<style scoped lang="scss"></style>
