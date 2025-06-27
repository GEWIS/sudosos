<template>
  <Button
    :disabled="disabled"
    :icon="icon"
    :label="labelText"
    :severity="severity"
    :type="type"
    @blur="reset"
    @click="handleClick"
  />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const props = defineProps<{
  disabled?: boolean;
  icon?: string;
  type?: 'button' | 'submit' | 'reset';
  initialLabel?: string;
  confirmLabel?: string;
  confirmTimeoutMs?: number;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
}>();

const clickedOnce = ref(false);
let timeoutId: ReturnType<typeof setTimeout> | null = null;

const labelText = computed(() =>
  clickedOnce.value ? (props.confirmLabel ?? 'Confirm') : (props.initialLabel ?? 'Save'),
);

const severity = computed(() => (clickedOnce.value ? 'danger' : 'primary'));

function handleClick() {
  if (clickedOnce.value) {
    emit('confirm');
    reset();
  } else {
    clickedOnce.value = true;
    // Start or reset timeout
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      reset();
    }, props.confirmTimeoutMs ?? 3000); // default 3 seconds
  }
}

function reset() {
  clickedOnce.value = false;
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }
}
</script>
