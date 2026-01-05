<template>
  <div>
    <span
      :class="[
        'flex flex-wrap justify-content-between',
        column ? 'flex-column gap-1' : 'flex-row align-items-center gap-3',
      ]"
    >
      <FindRole v-model:role="internalValue" :default="props.default" :placeholder="placeholder" />
    </span>
    <div class="flex justify-content-end">
      <ErrorSpan :error="errors" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, type PropType, ref, watch } from 'vue';
import { type RoleResponse } from '@sudosos/sudosos-client';
import ErrorSpan from '@/components/ErrorSpan.vue';
import FindRole from '@/components/FindRole.vue';

const emit = defineEmits(['update:value']);

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  default: {
    type: Object as PropType<RoleResponse>,
    required: false,
    default: null,
  },
  value: {
    type: Object as PropType<RoleResponse>,
    required: false,
    default: null,
  },
  errors: {
    type: Object as PropType<string>,
    required: false,
    default: null,
  },
  placeholder: {
    type: String,
    required: false,
    default: '',
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  column: {
    type: Boolean,
    required: false,
    default: false,
  },
});

const internalValue = ref();

onMounted(() => {
  internalValue.value = props.value;
});

watch(
  () => props.value,
  (newValue) => {
    internalValue.value = newValue;
  },
);

watch(internalValue, (newValue) => {
  if (newValue !== props.value) {
    emit('update:value', newValue);
  }
});
</script>

<style scoped lang="scss"></style>
