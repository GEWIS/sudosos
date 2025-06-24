<template>
  <div>
    <span v-if="imageSource" class="relative line-height-0 max-w-screen-lg mx-1 block">
      <img alt="Banner" class="w-full border-round shadow-1 block" :src="imageSource" />
      <button
        ref="previewButton"
        class="image-overlay-button absolute top-0 left-0 w-full h-full flex justify-center items-center border-none p-0"
        type="button"
        @click="fileInput?.click()"
      >
        <i class="pi pi-upload text-white text-3xl"></i>
        <input ref="fileInput" accept="image/*" class="hidden" type="file" @change="onImgUpload" />
      </button>
    </span>

    <div v-else class="p-5 surface-hover text-center text-xl border-round relative">
      <div class="mt-3">
        <button ref="previewButton" class="p-button p-button-sm" type="button" @click="fileInput?.click()">
          <i class="pi pi-upload mr-2" />
          {{ t('modules.admin.banners.noBannerFound') }}
        </button>
        <input ref="fileInput" accept="image/*" class="hidden" type="file" @change="onImgUpload" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, type PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { BannerResponse } from '@sudosos/sudosos-client';
import type { bannerSchema } from '@/utils/validation-schema';
import { type Form, getProperty } from '@/utils/formUtils';
import { getBannerImageSrc } from '@/utils/urlUtils';
import * as yup from 'yup';

const { t } = useI18n();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof bannerSchema>>>,
    required: true,
  },
});

const fileInput = ref<HTMLInputElement>();

const uploadedImage = ref<File | null>(null);

const imageSource = computed(() => {
  const image = getProperty(props.form, 'image');
  if (uploadedImage.value == null) {
    const img = { image };
    return image && getBannerImageSrc(img as BannerResponse);
  }
  return URL.createObjectURL(uploadedImage.value);
});

const onImgUpload = (e: Event) => {
  const el = e.target as HTMLInputElement;
  if (!el?.files?.length) return;
  uploadedImage.value = el.files[0];
  props.form.context.setFieldValue('file', uploadedImage.value);
};
</script>

<style scoped>
.image-overlay-button {
  background-color: rgba(0, 0, 0, 0);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-overlay-button:hover {
  opacity: 1;
  background-color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
}
</style>
