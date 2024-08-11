<template>
  <span :class="['flex flex-wrap justify-content-between',
  column ? 'flex-column gap-1' : 'flex-row align-items-center gap-3']">
    <p class="my-0">{{ label }}</p>
      <InputText v-if="type === 'text'" :placeholder="placeholder"
                 v-model="internalValue" v-bind="attributes" :disabled="disabled"/>
      <Textarea v-if="type === 'textarea'" :placeholder="placeholder"
                v-model="internalValue" v-bind="attributes" autoResize :disabled="disabled"/>
      <Calendar v-if="type === 'date'" :placeholder="placeholder"
                v-model="internalValue" v-bind="attributes" :disabled="disabled"/>
  </span>
  <div class="flex justify-content-end">
    <ErrorSpan :error="errors"/>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, type PropType } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Calendar from 'primevue/calendar';
import type { Ref } from "vue";
import ErrorSpan from "@/components/ErrorSpan.vue";

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  attributes: {
    type: Object as PropType<any>,
    required: true,
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
  type: {
    type: String,
    required: false,
    default: 'text'
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

const emit = defineEmits(['update:value']);

const internalValue = ref('');

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
