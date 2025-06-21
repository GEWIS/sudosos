<template>
  <Dialog
    ref="dialog"
    v-model:visible="visible"
    class="w-1/2"
    :draggable="false"
    :header="
      banner != undefined ? t('modules.admin.forms.banner.headerEdit') : t('modules.admin.forms.banner.headerCreate')
    "
    modal
    @show="addListenerOnDialogueOverlay(dialog)"
  >
    <span v-if="imageSource" class="image-preview-container mx-1 w-full">
      <img alt="Banner" class="w-full" :src="imageSource" />
      <button
        ref="previewButton"
        class="fileupload image-preview-indicator p-image-preview-indicator"
        type="button"
        @click="fileInput.click()"
      >
        <i class="pi pi-upload"></i>
        <input ref="fileInput" accept="image/*" type="file" @change="onImgUpload" />
      </button>
    </span>
    <div v-else class="px-3 py-5 relative surface-hover text-center text-xl">
      {{ t('modules.admin.banners.noBannerFound') }} <br />
      <button
        ref="previewButton"
        class="cursor-pointer fileupload image-preview-indicator p-image-preview-indicator"
        type="button"
        @click="fileInput.click()"
      >
        <input ref="fileInput" accept="image/*" type="file" @change="onImgUpload" />
      </button>
    </div>
    <Divider />
    <div class="py-2">
      {{ t('common.name') }} <br />
      <InputText v-model="name" /> <br />
      <span class="font-bold text-red-500">{{ errors['Name'] }}</span>
    </div>
    <div class="py-2">
      {{ t('modules.admin.forms.banner.duration') }}<br />
      <InputNumber
        v-model="duration"
        :max-fraction-digits="3"
        :suffix="' ' + t('modules.admin.banners.seconds', duration || 0)"
      />
      <br />
      <span class="font-bold text-red-500">{{ errors['Duration'] }}</span>
    </div>
    <div class="py-2">
      {{ t('modules.admin.forms.banner.timespan') }}<br />
      <DatePicker v-model="startDate" hour-format="24" show-time />
      {{ t('modules.admin.banners.till') }}
      <DatePicker v-model="endDate" class="md:pt-0 pt-1" hour-format="24" show-time /><br />
      <span class="font-bold text-red-500">{{ errors['Start date'] }}</span
      ><br />
      <span class="font-bold text-red-500">{{ errors['End date'] }}</span>
    </div>
    <div class="py-2">
      {{ t('modules.admin.banners.till') }}<br />
      <ToggleSwitch v-model="active" />
    </div>
    <div class="items-end flex flex-col justify-end">
      <Button @click="onSubmit">{{ t('common.save') }}</Button>
    </div>
  </Dialog>
</template>
<script setup lang="ts">
import type { BannerRequest, BannerResponse } from '@sudosos/sudosos-client';
import { addListenerOnDialogueOverlay } from '@sudosos/sudosos-frontend-common';

import { ref, watch, computed } from 'vue';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import { useI18n } from 'vue-i18n';
import { useBannersStore } from '@/stores/banner.store';
import { getBannerImageSrc } from '@/utils/urlUtils';

const { t } = useI18n();

const dialog = ref(); // For addListenerOnDialogueOverlay

const fileInput = ref(); // input HTML element for opening on button click

const uploadedImage = ref<File>();

const imageSource = computed(() => {
  if (uploadedImage.value == null) {
    // Return null if banner or banner image is missing,
    // Else return banner image
    return banner.value?.image && getBannerImageSrc(banner.value);
  } else {
    return URL.createObjectURL(uploadedImage.value);
  }
});

const visible = defineModel<boolean>('visible');
// If Banner is undefined we are creating, otherwise editing.
const banner = defineModel<BannerResponse | undefined>('banner');

// Banner schema and validation
const bannerSchema = toTypedSchema(
  yup.object({
    Name: yup.string().required(),
    Duration: yup.number().required().moreThan(0),
    'Start date': yup.date().required(),
    'End date': yup.date().required().min(new Date()).min(yup.ref('Start date'), "End date can't be before start date"),
    Active: yup.boolean().required(),
  }),
);

const { errors, defineField, setFieldValue, handleSubmit, resetForm } = useForm({
  validationSchema: bannerSchema,
});

const [name] = defineField('Name');
const [duration] = defineField('Duration');
const [startDate] = defineField('Start date');
const [endDate] = defineField('End date');
const [active] = defineField('Active');

// Reset values everytime dialog is opened.
watch(visible, () => {
  if (visible.value) {
    resetValues();
  }
});

function resetValues() {
  resetForm();
  setFieldValue('Name', banner.value?.name, false);
  setFieldValue('Duration', banner.value && banner.value?.duration, false);
  setFieldValue('Start date', banner.value && new Date(banner.value?.startDate), false);
  setFieldValue('End date', banner.value && new Date(banner.value?.endDate), false);
  setFieldValue('Active', banner.value?.active);
  uploadedImage.value = undefined;
}

const bannersStore = useBannersStore();

const onSubmit = handleSubmit(async (values) => {
  const bannerRequest: BannerRequest = {
    name: values['Name'],
    duration: values['Duration'],
    active: values['Active'],
    startDate: values['Start date'].toISOString(),
    endDate: values['End date'].toISOString(),
  };

  if (banner.value != undefined) {
    // Edit existing banner

    // First upload image
    uploadedImage.value && (await bannersStore.updateBannerImage(banner.value.id, uploadedImage.value));
    // Then update and receive updated
    const resContent = await bannersStore.updateBanner(banner.value.id, bannerRequest);

    banner.value = resContent.data;

    visible.value = false;
  } else {
    // Create new banner

    // First create banner
    const resContent = await bannersStore.createBanner(bannerRequest);
    // Then set image
    uploadedImage.value && (await bannersStore.updateBannerImage(resContent.data.id, uploadedImage.value));

    await bannersStore.fetchBanners();

    visible.value = false;
  }
});

const onImgUpload = (e: Event) => {
  const el = e.target as HTMLInputElement;
  if (el == null || el.files == null) return;
  uploadedImage.value = el.files[0]!;
};
</script>
<style>
.image-preview-container {
  position: relative;
  display: inline-block;
  line-height: 0;
}

.image-preview-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
  border: none;
  padding: 0;
}

.fileupload > input[type='file'],
.fileupload-basic input[type='file'] {
  display: none;
}

.image-preview-container:hover > .image-preview-indicator {
  opacity: 1;
  cursor: pointer;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
