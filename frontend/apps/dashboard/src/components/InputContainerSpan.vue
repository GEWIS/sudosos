<template>
  <div>
    <span :class="['flex flex-wrap justify-between', column ? 'flex-col gap-1' : 'flex-row items-center gap-3']">
      <span class="my-0">{{ label }}</span>
      <Dropdown
        v-model="container"
        class="md:w-15rem w-full"
        option-label="name"
        :options="containers"
        :placeholder="placeholder"
      >
        <template #option="slotProps">
          {{ slotProps.option.name }}
        </template>
      </Dropdown>
    </span>
    <div class="flex justify-end">
      <ErrorSpan :error="errors" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount } from 'vue';
import ErrorSpan from '@/components/ErrorSpan.vue';
import { type ContainerInStore, useContainerStore } from '@/stores/container.store';

const containerStore = useContainerStore();

onBeforeMount(() => {
  void containerStore.fetchAllIfEmpty();
});

const containers = computed(() => {
  return Object.values(containerStore.getAllContainers);
});

withDefaults(
  defineProps<{
    label: string;
    errors?: string;
    placeholder?: string;
    disabled?: boolean;
    column?: boolean;
  }>(),
  {
    placeholder: '',
    disabled: false,
    column: false,
    errors: undefined,
  },
);

const container = defineModel<ContainerInStore>('container');
</script>

<style scoped lang="scss"></style>
