<template>
  <Button
      :label="label"
      :icon="buttonIcon"
      :severity="buttonSeverity"
      :loading="submitting"
      @click="$emit('click')"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  result: {
    type: Boolean,
    default: null,
  },
});

defineEmits(['click']);

const buttonIcon = ref('pi pi-check');
const buttonSeverity = ref('primary');

const updateResult = () => {
  if (props.result) {
    buttonSeverity.value = 'success';
    buttonIcon.value = 'pi pi-check';
  } else {
    buttonSeverity.value = 'danger';
    buttonIcon.value = 'pi pi-times';
  }
};

watch(() => props.result, () => {
  updateResult();
});

watch(() => props.submitting, () => {
  console.error('submitting', props.submitting, props.result);
  updateResult();
  if (props.submitting) {
    buttonIcon.value = 'pi pi-spin pi-spinner';
  }
});
</script>

<style scoped lang="scss">
</style>
