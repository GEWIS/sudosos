<template>
  <InputDropdownSpan
    v-model:selected-option="organ"
    :disabled="disabled"
    :errors="errors"
    :label="label"
    option-label="firstName"
    :options="organs || userOrgans"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import type { BaseUserResponse } from '@sudosos/sudosos-client';
import InputDropdownSpan from '@/components/InputDropdownSpan.vue';

const authStore = useAuthStore();

const userOrgans = computed(() => {
  return authStore.organs;
});

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
