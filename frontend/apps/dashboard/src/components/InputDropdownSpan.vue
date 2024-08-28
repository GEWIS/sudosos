<template>
  <div>
    <span :class="['flex justify-content-between',
     column ? 'flex-column gap-1' : 'flex-row align-items-center gap-3']">
      <span class="my-0">{{ label }}</span>
      <Dropdown
          v-model="selectedOption"
          :options="options"
          :optionLabel="optionLabel"
          :placeholder="placeholder"
          class="w-full md:w-15rem"
          :disabled="disabled"
      >
        <template #option="slotProps">
          {{ slotProps.option[optionLabel] }}
        </template>
      </Dropdown>
    </span>
    <div class="flex justify-content-end">
      <ErrorSpan :error="errors"/>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import ErrorSpan from "@/components/ErrorSpan.vue";
import { type PropType } from "vue";

defineProps({
  label: {
    type: String,
    required: true
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
  options: {
    type: Object as PropType<T[]>,
    required: true
  },
  optionLabel: {
    type: String,
    required: true
  }
});

const selectedOption = defineModel<T>('selectedOption');


</script>

<style scoped lang="scss">

</style>
