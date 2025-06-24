<template>
  <FormDialog
    v-model:model-value="visible"
    :form="form"
    :header="
      banner != undefined ? t('modules.admin.forms.banner.headerEdit') : t('modules.admin.forms.banner.headerCreate')
    "
    is-editable
    @close="visible = false"
  >
    <template #form="slotProps">
      <BannerForm :form="slotProps.form" @close="visible = false" />
    </template>
  </FormDialog>
</template>
<script setup lang="ts">
import type { BannerResponse } from '@sudosos/sudosos-client';

import { type Ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { schemaToForm } from '@/utils/formUtils';
import { bannerSchema } from '@/utils/validation-schema';
import BannerForm from '@/modules/admin/components/banners/forms/BannerForm.vue';
import FormDialog from '@/components/FormDialog.vue';

const { t } = useI18n();

const form = schemaToForm(bannerSchema);

const visible: Ref<boolean> = defineModel<boolean>('visible', { required: true, default: false });

const banner = defineModel<BannerResponse | undefined>('banner');

const DAY = 24 * 60 * 60 * 1000;

const updateFieldValues = (b: BannerResponse | undefined) => {
  if (!b) {
    form.context.resetForm({
      values: {
        name: undefined,
        duration: 10,
        startDate: new Date(Date.now() - DAY).toISOString(),
        endDate: new Date(Date.now() + DAY).toISOString(),
        active: true,
        image: undefined,
        id: undefined,
        file: undefined,
      },
    });
    return;
  }

  const values = {
    name: b.name,
    duration: b.duration,
    startDate: b.startDate,
    endDate: b.endDate,
    active: b.active,
    image: b.image,
    id: b.id,
    file: undefined,
  };
  form.context.resetForm({ values });
};

watch(
  () => visible.value,
  (vis) => {
    if (vis) updateFieldValues(banner.value);
    else form.context.resetForm({});
  },
);
</script>
<style></style>
