<template>
  <div>
    <span :class="['flex justify-between', column ? 'flex-col gap-1' : 'flex-row items-center gap-3']">
      <span class="my-0">{{ label }}</span>
      <Select
        v-model="selectedOption"
        class="flex-grow"
        :disabled="disabled"
        :option-label="optionLabel"
        :options="options"
        :placeholder="placeholder"
        v-bind="attrs"
      >
        <template #option="slotProps">
          {{ slotProps.option[optionLabel] }}
        </template>
      </Select>
    </span>
    <div class="flex justify-end">
      <ErrorSpan :error="errors" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import { useAttrs } from 'vue';
import ErrorSpan from '@/components/ErrorSpan.vue';

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

withDefaults(
  defineProps<{
    label: string;
    errors?: string;
    placeholder?: string;
    disabled?: boolean;
    column?: boolean;
    options: T[];
    optionLabel: string;
  }>(),
  {
    placeholder: '',
    disabled: false,
    column: false,
    errors: undefined,
  },
);

const selectedOption = defineModel<T>('selectedOption');
</script>

<style scoped lang="scss"></style>
