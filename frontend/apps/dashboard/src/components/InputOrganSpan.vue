<template>
  <div>
    <span :class="['flex flex-wrap justify-content-between',
     column ? 'flex-column gap-1' : 'flex-row align-items-center gap-3']">
      <span class="my-0">{{ label }}</span>
      <Dropdown
          v-model="organ"
          :options="organs"
          optionLabel="firstName"
          :placeholder="placeholder"
          class="w-full md:w-15rem"
      >
    <template #option="slotProps">
      {{ fullName(slotProps.option) }}
    </template>
  </Dropdown>
    </span>
    <div class="flex justify-content-end">
      <ErrorSpan :error="errors"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import ErrorSpan from "@/components/ErrorSpan.vue";
import { computed, type PropType } from "vue";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { fullName } from "@/utils/formatterUtils";
import type { BaseUserResponse } from "@sudosos/sudosos-client";

const authStore = useAuthStore();

const organs = computed(() => {
  return authStore.organs;
});

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
});

const organ = defineModel<BaseUserResponse>('organ');

</script>

<style scoped lang="scss">

</style>
