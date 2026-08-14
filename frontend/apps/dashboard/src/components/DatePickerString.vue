<template>
  <DatePicker
    v-if="type === 'date'"
    v-model="internalDate"
    v-bind="attributes"
    :disabled="disabled"
    :placeholder="placeholder"
    @input="updateStringValue"
  />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { BaseFieldProps, GenericObject } from 'vee-validate';

// Define the component's props
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    placeholder?: string;
    attributes?: BaseFieldProps & GenericObject;
    disabled?: boolean;
    type?: string;
    dateFormat?: string;
  }>(),
  {
    modelValue: '',
    placeholder: '',
    attributes: undefined,
    disabled: false,
    type: 'date',
    dateFormat: 'yyyy-MM-dd',
  },
);

// Define the component's events
const emit = defineEmits(['update:modelValue']);

// Reactive reference to hold the internal date as a Date object
const internalDate = ref<Date | null>(stringToDate(props.modelValue));

// Watch for changes in modelValue and update internalDate accordingly
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== dateToString(internalDate.value)) {
      internalDate.value = stringToDate(newValue);
    }
  },
);

// Watch for changes in internalDate and emit updates to the modelValue
watch(internalDate, (newDate) => {
  if (dateToString(newDate) !== props.modelValue) {
    emit('update:modelValue', dateToString(newDate));
  }
});

// Function to convert a string date to a Date object
function stringToDate(dateString: string): Date | null {
  if (!dateString) return null;
  if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateString)) return null; // Basic validation
  const parts = dateString.split('-');
  const year = parseInt(parts[0]!, 10);
  const month = parseInt(parts[1]!, 10) - 1; // Months are zero-indexed
  const day = parseInt(parts[2]!, 10);
  return new Date(year, month, day);
}

// Function to convert a Date object to a string
function dateToString(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Zero-padding
  const day = String(date.getDate()).padStart(2, '0'); // Zero-padding
  return `${year}-${month}-${day}`;
}

// Function to emit the updated string representation of the date
function updateStringValue(newDate: Event) {
  const newString = dateToString(newDate as unknown as Date);
  emit('update:modelValue', newString); // Emit the string representation
}
</script>
