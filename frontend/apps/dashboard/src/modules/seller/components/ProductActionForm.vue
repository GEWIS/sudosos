<template>
  <div class="flex flex-col gap-1">
    <InputSpan
      id="name"
      v-bind="form.model.name.attr.value"
      :disabled="!isEditable"
      :errors="form.context.errors.value.name"
      :label="t('common.name')"
      :placeholder="t('common.placeholders.product')"
      type="text"
      :value="form.model.name.value.value"
      @update:value="form.context.setFieldValue('name', $event)"
    />
    <span
      v-if="closeTo && !form.context.errors.value.name"
      class="text-sm text-blue-600 cursor-pointer hover:underline"
      @click="selectCloseTo"
    >
      {{ t('modules.seller.forms.product.closeTo', { name: closeTo.name }) }}</span
    >
    <InputSelectSpan
      :disabled="!isEditable"
      :label="t('modules.seller.productContainers.products.category')"
      option-label="name"
      :options="productCategories"
      :placeholder="t('modules.seller.forms.product.selectCategory')"
      :selected-option="form.model.category.value.value"
      @update:selected-option="form.context.setFieldValue('category', $event!)"
    />
    <InputSelectSpan
      :disabled="!isEditable"
      :label="t('modules.seller.productContainers.products.vat')"
      option-label="name"
      :options="vatGroups"
      :placeholder="t('modules.seller.forms.product.selectVat')"
      :selected-option="form.model.vat.value.value"
      @update:selected-option="form.context.setFieldValue('vat', $event!)"
    />

    <InputSpan
      id="alcoholPercentage"
      v-bind="form.model.alcoholPercentage.attr.value"
      :disabled="!isEditable"
      :errors="form.context.errors.value.alcoholPercentage"
      :label="t('modules.seller.productContainers.products.alcoholPercentage')"
      type="percentage"
      :value="form.model.alcoholPercentage.value.value"
      @update:value="form.context.setFieldValue('alcoholPercentage', $event)"
    />

    <InputSpan
      id="priceInclVat"
      v-bind="form.model.priceInclVat.attr.value"
      :disabled="!isEditable"
      :errors="form.context.errors.value.priceInclVat"
      :label="t('common.price')"
      type="currency"
      :value="form.model.priceInclVat.value.value"
      @update:value="form.context.setFieldValue('priceInclVat', $event)"
    />

    <div class="items-center flex flex-row gap-1 justify-between">
      <i
        v-tooltip.top="t('common.tooltip.productOwner')"
        class="cursor-pointer pi pi-exclamation-circle text-red-500"
      />
      <InputOrganSpan
        class="input-field w-76 justify-center"
        :disabled="!isOrganEditable || !isEditable"
        :errors="form.context.errors.value.owner"
        :label="t('modules.seller.productContainers.products.owner')"
        :organ="form.model.owner.value.value"
        :organs="!isOrganEditable ? [form.model.owner.value.value] : undefined"
        @update:organ="form.context.setFieldValue('owner', $event!)"
      />
    </div>

    <div class="flex flex-col gap-1 justify-between">
      <InputSpan
        id="preferred"
        v-bind="form.model.preferred.attr.value"
        :disabled="!isEditable"
        :errors="form.context.errors.value.preferred"
        :label="t('modules.seller.productContainers.products.preferred')"
        type="boolean"
        :value="form.model.preferred.value.value"
        @update:value="form.context.setFieldValue('preferred', $event)"
      />
      <InputSpan
        id="featured"
        v-bind="form.model.featured.attr.value"
        :disabled="!isEditable"
        :errors="form.context.errors.value.featured"
        :label="t('modules.seller.productContainers.products.featured')"
        type="boolean"
        :value="form.model.featured.value.value"
        @update:value="form.context.setFieldValue('featured', $event)"
      />
      <InputSpan
        id="priceList"
        v-bind="form.model.priceList.attr.value"
        :disabled="!isEditable"
        :errors="form.context.errors.value.priceList"
        :label="t('modules.seller.productContainers.products.priceList')"
        type="boolean"
        :value="form.model.priceList.value.value"
        @update:value="form.context.setFieldValue('priceList', $event)"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import * as yup from 'yup';
import type { BaseVatGroupResponse, ProductCategoryResponse, ProductResponse } from '@sudosos/sudosos-client';
import { ref, watch } from 'vue';
import Fuse from 'fuse.js';
import { useI18n } from 'vue-i18n';
import InputSpan from '@/components/InputSpan.vue';
import type { createProductSchema } from '@/utils/validation-schema';
import { type Form } from '@/utils/formUtils';
import InputOrganSpan from '@/components/InputOrganSpan.vue';
import InputSelectSpan from '@/components/InputSelectSpan.vue';

const { t } = useI18n();

const props = defineProps<{
  form: Form<yup.InferType<typeof createProductSchema>>;
  productCategories: ProductCategoryResponse[];
  vatGroups: BaseVatGroupResponse[];
  products?: ProductResponse[];
  isEditable?: boolean;
  isOrganEditable?: boolean;
}>();

const selectExistingProduct = defineModel<ProductResponse | null>('existingProduct');

// Give user a warning if making possible duplicate product
const closeTo = ref<ProductResponse | null>(null);
watch(props.form.model.name.value, () => {
  if (selectExistingProduct.value) return;
  if (!props.form.model.name.value.value) return;
  if (!props.products) return;

  const fuse = new Fuse(props.products, {
    keys: ['name'],
    includeScore: true,
    threshold: 0.3,
  });

  // Search for products with a similar name
  const results = fuse.search(props.form.model.name.value.value);

  // If a similar product is found, update the 'similar' value
  const closest = results[0];
  if (!closest) {
    closeTo.value = null;
    return;
  }
  if (closest.score && results.length > 0 && closest.score < 0.3) {
    closeTo.value = results[0].item;
  } else {
    closeTo.value = null;
  }
});

const selectCloseTo = () => {
  if (!closeTo.value) return;
  selectExistingProduct.value = closeTo.value;
  closeTo.value = null;
};
</script>

<style scoped lang="scss">
.error-text {
  position: absolute;
  bottom: -1.5rem;
  left: 0;
  color: red;
  font-size: 0.875rem;
  text-align: right;
  width: 100%;
}

.error-text-name {
  color: red;
  font-size: 0.875rem;
  text-align: right;
  width: 17rem;
  cursor: pointer;
}
</style>
