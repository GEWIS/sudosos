<template>
  <div>
    <img alt="logo" class="block max-h-[9rem] mx-auto my-0" src="@/assets/img/bier.png" />
    <div class="text-900 text-5xl mt-2 mx-auto mb-2 w-full">
      {{ header }}
    </div>
    <Card class="w-[22rem]">
      <template #content>
        <slot />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  header?: string;
}>();
</script>
