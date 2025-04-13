<template>
  <div class="align-items-center flex flex-column gap-3">
    <div class="p-3 picture-container">
      <img v-if="imageSrc" alt="Product" class="product-image" :src="imageSrc" />
      <img v-else alt="Default product" class="product-image" src="../../../assets/img/bier.png" />
    </div>
    <div v-if="isEditable">
      <FileUpload id="img" accept="image/*" mode="basic" name="productImg" @select="emit('upload', $event.files[0])" />
    </div>
  </div>
</template>

<script setup lang="ts">
import FileUpload from 'primevue/fileupload';

defineProps<{
  isEditable?: boolean;
  imageSrc?: string;
}>();

const emit = defineEmits<{
  upload: [image: File];
}>();
</script>

<style scoped lang="scss">
.alt-dialog-content {
  padding: 0 !important;
}

.picture-container {
  width: 21rem;
  height: 21rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: 100%;
  object-fit: cover;
}
</style>
