<template>
  <div
    class="flex justify-center items-center bg-white w-[21rem] h-[21rem] p-3 relative group"
    :class="isEditable ? 'cursor-pointer' : ''"
  >
    <img v-if="imageSrc" alt="Product" class="max-w-full max-h-full w-auto h-full object-cover" :src="imageSrc" />
    <img
      v-else
      alt="Default product"
      class="max-w-full max-h-full w-auto h-full object-cover"
      src="@/assets/img/bier.png"
    />
    <button
      v-if="isEditable"
      class="absolute inset-0 w-full h-full flex items-center justify-center bg-black/0 opacity-0 group-hover:opacity-100 group-hover:bg-black/50 transition duration-200 cursor-pointer"
      type="button"
      @click="fileInput?.click()"
    >
      <i class="pi pi-upload text-white text-3xl"></i>
      <input ref="fileInput" accept="image/*" class="hidden" type="file" @change="onImgUpload" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  isEditable?: boolean;
  imageSrc?: string;
}>();

const emit = defineEmits<{
  upload: [image: File];
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const onImgUpload = (e: Event) => {
  const el = e.target as HTMLInputElement;
  if (!(el?.files?.length && el.files[0])) return;
  emit('upload', el.files[0]);
};
</script>
