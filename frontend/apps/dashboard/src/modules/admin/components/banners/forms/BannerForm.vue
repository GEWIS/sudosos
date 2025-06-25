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
import type { BannerRequest } from '@sudosos/sudosos-client';
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

const updateImage = (id: number, file?: File | null) => {
  if (!file) return;
  return bannersStore.updateBannerImage(id, file).catch((e) => {
    handleError(e, toast);
  });
};

setSubmit(
  props.form,
  props.form.context.handleSubmit((values) => {
    const bannerRequest: BannerRequest = {
      name: values.name,
      duration: values.duration,
      active: values.active,
      startDate: values.startDate,
      endDate: values.endDate,
    };

    // Banner exists, update
    if (values.id) {
      void updateImage(values.id, values.file);
      bannersStore
        .updateBanner(values.id, bannerRequest)
        .then(() => {
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('modules.admin.forms.banner.toast.success.bannerUpdated'),
            life: 3000,
          });
          emit('close', true);
        })
        .catch((e) => {
          handleError(e, toast);
        });
    } else {
      // Banner does not exist, create
      bannersStore
        .createBanner(bannerRequest)
        .then((b) => {
          if (!b.data.id) return;
          void updateImage(b.data.id, values.file);
          toast.add({
            severity: 'success',
            summary: t('common.toast.success.success'),
            detail: t('modules.admin.forms.banner.toast.success.bannerCreated'),
            life: 3000,
          });
          emit('close', true);
        })
        .catch((e) => {
          handleError(e, toast);
        });
    }
  }),
);
</script>

<style scoped lang="scss"></style>
