<template>
  <div>
    <BannerImageForm class="max-w-[50rem]" :form="form" />
    <Divider />
    <div class="flex flex-col gap-3">
      <InputSpan
        id="name"
        v-bind="form.model.name.attr.value"
        class="max-w-[15rem]"
        :errors="form.context.errors.value.name"
        :label="t('common.name')"
        :placeholder="t('common.placeholders.fullName')"
        type="text"
        :value="form.model.name.value.value"
        @update:value="form.context.setFieldValue('name', $event)"
      />
      <InputSpan
        id="duration"
        v-bind="form.model.duration.attr.value"
        class="max-w-[15rem]"
        :errors="form.context.errors.value.duration"
        :label="t('modules.admin.forms.banner.duration')"
        suffix=" Seconds"
        type="number"
        :value="form.model.duration.value.value"
        @update:value="form.context.setFieldValue('duration', $event)"
      />
      <InputSpan
        id="startDate"
        v-bind="form.model.startDate.attr.value"
        class="max-w-[15rem]"
        :errors="form.context.errors.value.startDate"
        :label="t('modules.admin.forms.banner.startDate')"
        type="date"
        :value="form.model.startDate.value.value"
        @update:value="form.context.setFieldValue('startDate', $event)"
      />
      <InputSpan
        id="endDate"
        v-bind="form.model.endDate.attr.value"
        class="max-w-[15rem]"
        :errors="form.context.errors.value.endDate"
        :label="t('modules.admin.forms.banner.endDate')"
        type="date"
        :value="form.model.endDate.value.value"
        @update:value="form.context.setFieldValue('endDate', $event)"
      />
      <InputSpan
        id="active"
        :attributes="form.model.active.attr.value"
        :errors="form.context.errors.value.active"
        :label="t('modules.admin.forms.banner.active')"
        type="boolean"
        :value="form.model.active.value.value"
        @update:value="form.context.setFieldValue('active', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import { useI18n } from 'vue-i18n';
import type { BannerRequest } from '@gewis/sudosos-client';
import type { AxiosError } from 'axios';
import { useToast } from 'primevue/usetoast';
import * as yup from 'yup';
import type { bannerSchema } from '@/utils/validation-schema';
import { type Form, setSubmit } from '@/utils/formUtils';
import BannerImageForm from '@/modules/admin/components/banners/forms/BannerImageForm.vue';
import InputSpan from '@/components/InputSpan.vue';
import { useBannersStore } from '@/stores/banner.store';
import { handleError } from '@/utils/errorUtils';

const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  form: {
    type: Object as PropType<Form<yup.InferType<typeof bannerSchema>>>,
    required: true,
  },
});

const emit = defineEmits(['close']);

const bannersStore = useBannersStore();

const updateImage = async (id: number, file?: File | null) => {
  if (!file) return;
  await bannersStore.updateBannerImage(id, file);
};

const showSuccess = (detail: string) => {
  toast.add({
    severity: 'success',
    summary: t('common.toast.success.success'),
    detail,
    life: 3000,
  });
};

const submitBanner = props.form.context.handleSubmit(async (values) => {
  const bannerRequest: BannerRequest = {
    name: values.name,
    duration: values.duration,
    active: values.active,
    startDate: values.startDate,
    endDate: values.endDate,
  };

  // Banner exists, update
  if (values.id) {
    try {
      // Upload the image first, so a rejected image leaves the banner untouched.
      await updateImage(values.id, values.file);
      await bannersStore.updateBanner(values.id, bannerRequest);
    } catch (e) {
      handleError(e as AxiosError, toast);
      return;
    }
    showSuccess(t('modules.admin.forms.banner.toast.success.bannerUpdated'));
    emit('close', true);
    return;
  }

  // Banner does not exist, create
  let bannerId: number;
  try {
    const b = await bannersStore.createBanner(bannerRequest);
    bannerId = b.data.id;
  } catch (e) {
    handleError(e as AxiosError, toast);
    return;
  }

  try {
    await updateImage(bannerId, values.file);
  } catch (e) {
    // The banner now exists, so submitting again must update it instead of creating a duplicate.
    props.form.context.setFieldValue('id', bannerId);
    handleError(e as AxiosError, toast);
    return;
  }
  showSuccess(t('modules.admin.forms.banner.toast.success.bannerCreated'));
  emit('close', true);
});

setSubmit(props.form, async () => {
  await submitBanner();
});
</script>

<style scoped lang="scss"></style>
