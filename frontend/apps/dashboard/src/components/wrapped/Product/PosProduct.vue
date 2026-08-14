<template>
  <div class="relative text-center shadow-lg bg-white text-black p-2 mx-2 my-1 flex flex-col rounded-lg">
    <div class="flex-1 min-h-0 flex items-center justify-center">
      <img :alt="props.name" class="h-full w-auto max-w-full object-contain rounded-lg" :src="image" />
    </div>
    <div class="h-14 flex flex-col justify-center px-2">
      <div class="h-[2.76em] flex items-center justify-center">
        <p class="text-base font-bold leading-none m-0 line-clamp-3 pb-[0.1em]">{{ props.name }}</p>
      </div>
      <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
      <p class="text-xs m-0">€{{ props.price }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  name: string;
  image: string;
  price: string;
}>();
</script>

<style scoped lang="scss"></style>
