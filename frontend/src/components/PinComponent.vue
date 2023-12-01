<template>
<InputText
  type="password"
  autocomplete="off"
  :value="modelValue"
  @input="$emit('update:modelValue', $event.target.value)"
/>
</template>

<script setup lang="ts">
import InputText from "primevue/inputtext";

defineProps(['modelValue']);
defineEmits(['update:modelValue']);

</script>
<style scoped>

</style>
