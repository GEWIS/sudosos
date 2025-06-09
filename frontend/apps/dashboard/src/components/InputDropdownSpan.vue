<template>
  <div>
    <span :class="['flex justify-between', column ? 'flex-col gap-1' : 'flex-row items-center gap-3']">
      <span class="my-0">{{ label }}</span>
      <Dropdown
        v-model="selectedOption"
        class="md:w-15rem w-full"
        :disabled="disabled"
        :option-label="optionLabel"
        :options="options"
        :placeholder="placeholder"
      >
        <template #option="slotProps">
          {{ slotProps.option[optionLabel] }}
        </template>
      </Dropdown>
    </span>
    <div class="flex justify-end">
      <ErrorSpan :error="errors" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import ErrorSpan from '@/components/ErrorSpan.vue';

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
