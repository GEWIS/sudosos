<template>
  <Button :icon="buttonIcon" :label="label" :loading="submitting" :severity="buttonSeverity" @click="$emit('click')" />
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';
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
    type: Boolean as PropType<boolean | null>,
    default: null,
  },
});

defineEmits(['click']);

const buttonIcon = ref('pi pi-check');
const buttonSeverity = ref('primary');

const updateResult = () => {
  if (props.result === null) {
    buttonSeverity.value = 'primary';
    buttonIcon.value = 'pi pi-check';
    return;
  }
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
    updateResult();
    if (props.submitting) {
      buttonIcon.value = 'pi pi-spin pi-spinner';
    }
  },
);
</script>

<style scoped lang="scss"></style>
