<template>
  <Button :icon="buttonIcon" :label="label" :loading="submitting" :severity="buttonSeverity" @click="$emit('click')" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import Button from 'primevue/button';

const props = defineProps({
  /** Button text. */
  label: {
    type: String,
    required: true,
  },
  /** Shows a spinner and PrimeVue's loading state while true. */
  submitting: {
    type: Boolean,
    default: false,
  },
  /**
   * Outcome of the last attempt: true flashes success (green check), false
   * flashes danger (red X). Leave unset before the first attempt.
   */
  result: {
    type: Boolean,
    default: null,
  },
});

defineEmits(['click']);

const buttonIcon = ref('pi pi-check');
const buttonSeverity = ref('primary');

const updateResult = () => {
  if (props.result === null) return;
  if (props.result) {
    buttonSeverity.value = 'success';
    buttonIcon.value = 'pi pi-check';
  } else {
    buttonSeverity.value = 'danger';
    buttonIcon.value = 'pi pi-times';
  }
};

watch(
  () => props.result,
  () => {
    updateResult();
  },
  { immediate: true },
);

watch(
  () => props.submitting,
  () => {
    console.error('submitting', props.submitting, props.result);
    updateResult();
    if (props.submitting) {
      buttonIcon.value = 'pi pi-spin pi-spinner';
    }
  },
);
</script>

<style scoped lang="scss"></style>
