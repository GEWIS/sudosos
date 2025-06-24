<template>
  <div v-if="error" class="mt-2">
    <small class="p-error flex items-center gap-1">
      <i class="pi pi-exclamation-circle" />
      {{ error }}
    </small>
  </div>
</template>

<script setup lang="ts">
defineProps({
  error: {
    type: String,
    required: false,
    default: null,
  },
});
</script>
