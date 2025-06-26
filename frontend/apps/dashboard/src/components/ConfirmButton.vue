<template>
  <Button :disabled="disabled" :icon="icon" :label="labelText" :severity="severity" :type="type" @click="handleClick" />
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const props = defineProps<{
  disabled?: boolean;
  icon?: string;
  type?: 'button' | 'submit' | 'reset';
  initialLabel?: string;
  confirmLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'confirm'): void;
}>();

const clickedOnce = ref(false);
const labelText = computed(() =>
  clickedOnce.value ? (props.confirmLabel ?? 'Confirm') : (props.initialLabel ?? 'Save'),
);

const severity = computed(() => (clickedOnce.value ? 'danger' : 'primary'));

function handleClick() {
  if (clickedOnce.value) {
    emit('confirm');
    clickedOnce.value = false;
  } else {
    clickedOnce.value = true;
  }
}
</script>
