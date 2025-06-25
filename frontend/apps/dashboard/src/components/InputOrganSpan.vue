<template>
  <InputSelectSpan
    v-model:selected-option="organ"
    :disabled="disabled"
    :errors="errors"
    :label="label"
    option-label="firstName"
    :options="organs || userOrgans"
    v-bind="attrs"
  />
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import type { BaseUserResponse } from '@sudosos/sudosos-client';
import InputSelectSpan from '@/components/InputSelectSpan.vue';

const authStore = useAuthStore();

const userOrgans = computed(() => {
  return authStore.organs;
});

defineOptions({ inheritAttrs: false });
const attrs = useAttrs();

withDefaults(
  defineProps<{
    label: string;
    errors?: string;
    placeholder?: string;
    disabled?: boolean;
    column?: boolean;
    organs?: BaseUserResponse[];
  }>(),
  {
    placeholder: '',
    errors: undefined,
    disabled: false,
    column: false,
    organs: undefined,
  },
);

const organ = defineModel<BaseUserResponse>('organ');
</script>

<style scoped lang="scss"></style>
