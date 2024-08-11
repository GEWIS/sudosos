<template>
  <div>
    <span :class="['flex flex-wrap justify-content-between',
     column ? 'flex-column gap-1' : 'flex-row align-items-center gap-3']">
      <span class="my-0">{{ label }}</span>
      <FindUser  :placeholder="placeholder"
                 v-model="internalValue"
                 :disabled="disabled"/>
    </span>
    <div class="flex justify-content-end">
      <ErrorSpan :error="errors"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import ErrorSpan from "@/components/ErrorSpan.vue";
import { onMounted, type PropType, ref, watch } from "vue";
import FindUser from "@/components/FindUser.vue";
import type { BaseUserResponse } from "@sudosos/sudosos-client";

const emit = defineEmits(['update:value']);

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: Object as PropType<BaseUserResponse>,
  },
  errors: {
    type: Object as PropType<any>,
    required: false,
  },
  placeholder: {
    type: String,
    required: false,
    default: ''
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  column: {
    type: Boolean,
    required: false,
    default: false
  },
});

const internalValue = ref();

onMounted(() => {
  internalValue.value = props.value;
});

watch(() => props.value, (newValue) => {
  internalValue.value = newValue;
});

watch(internalValue, (newValue) => {
  if (newValue !== props.value) {
    emit('update:value', newValue);
  }
});

</script>

<style scoped lang="scss">

</style>
