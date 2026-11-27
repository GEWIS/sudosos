<template>
  <div class="relative text-center shadow-lg bg-white text-black p-2 mx-2 my-1 flex flex-col rounded-lg">
    <div class="flex-1 min-h-0 flex items-center justify-center">
      <img :alt="name" class="h-full w-auto max-w-full object-contain rounded-lg" :src="image" />
    </div>
    <div class="h-14 flex items-center justify-center px-2">
      <p class="text-base font-bold leading-none m-0 line-clamp-3 pb-[0.1em]">{{ name }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  image: string;
}>();
</script>
