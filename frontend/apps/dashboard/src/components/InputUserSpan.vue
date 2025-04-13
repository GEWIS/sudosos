<template>
  <div>
    <span
      :class="[
        'flex flex-wrap justify-content-between',
        column ? 'flex-column gap-1' : 'flex-row align-items-center gap-3',
      ]"
    >
      <span class="my-0">{{ label }}</span>
      <FindUser
        v-model:user="internalValue"
        :default="props.default"
        :disabled="disabled"
        :placeholder="placeholder"
        :show-positive="props.showPositive"
        :type="type"
      />
    </span>
    <div class="flex justify-content-end">
      <ErrorSpan :error="errors" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { type BaseUserResponse, GetAllUsersTypeEnum } from '@sudosos/sudosos-client';
import ErrorSpan from '@/components/ErrorSpan.vue';
import FindUser from '@/components/FindUser.vue';

const emit = defineEmits(['update:value']);

const props = withDefaults(
  defineProps<{
    label: string;
    default?: BaseUserResponse;
    value?: BaseUserResponse;
    errors?: string;
    placeholder?: string;
    disabled?: boolean;
    column?: boolean;
    type?: GetAllUsersTypeEnum;
    showPositive?: boolean;
  }>(),
  {
    default: undefined,
    value: undefined,
    errors: undefined,
    placeholder: '',
    type: undefined,
    showPositive: true,
  },
);

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
