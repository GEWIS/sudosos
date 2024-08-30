<template>
  <div class="flex flex-column justify-content-between gap-2">
    <InputSpan :label="t('c_productContainerOperations.Name')"
               :value="form.model.name.value.value"
               :attributes="form.model.name.attr.value"
               @update:value="form.context.setFieldValue('name', $event)"
               :errors="form.context.errors.value.name"
               id="name" :placeholder="t('c_productContainerOperations.Name')" type="text"
               :disabled="!isEditable"/>
    <span
        class="error-text-name block w15-rem"
        v-if="closeTo && !form.context.errors.value.name"
        @click="selectCloseTo">
                {{ t('c_productContainerOperations.Close To', {name: closeTo.name}) }}</span>

    <InputDropdownSpan
        :label="t('c_productContainerOperations.Category')"
        :options="productCategories"
        option-label="name"
        :selected-option="form.model.category.value.value"
        @update:selected-option="form.context.setFieldValue('category', $event)"
        :placeholder="t('c_productContainerOperations.Please select')"
        :disabled="!isEditable"/>

    <InputDropdownSpan
        :label="t('c_productContainerOperations.VAT')"
        :options="vatGroups"
        option-label="name"
        :selected-option="form.model.vat.value.value"
        @update:selected-option="form.context.setFieldValue('vat', $event)"
        :placeholder="t('c_productContainerOperations.Please select VAT')"
        :disabled="!isEditable"/>

    <InputSpan :label="t('c_productContainerOperations.Alcohol Percentage')"
               :value="form.model.alcoholPercentage.value.value"
               :attributes="form.model.alcoholPercentage.attr.value"
               @update:value="form.context.setFieldValue('alcoholPercentage', $event)"
               :errors="form.context.errors.value.alcoholPercentage"
               id="alcoholPercentage" type="percentage"
               :disabled="!isEditable"/>

    <InputSpan :label="t('c_productContainerOperations.Price')"
               :value="form.model.priceInclVat.value.value"
               :attributes="form.model.priceInclVat.attr.value"
               @update:value="form.context.setFieldValue('priceInclVat', $event)"
               :errors="form.context.errors.value.priceInclVat"
               id="priceInclVat" type="currency"
               :disabled="!isEditable"/>

    <!-- If the organ is not editable, add a fake option menu so the dropdown still renders  -->
    <div class="flex flex-row justify-content-between align-items-center gap-1">
      <i class="pi pi-exclamation-circle text-red-500 cursor-pointer"
         v-tooltip.top="t('tooltip.productOwner')"/>
      <InputOrganSpan :label="t('c_POSCreate.Owner')"
                      :organs="!isOrganEditable
                        ? [form.model.owner.value.value]
                        : undefined"
                      :organ="form.model.owner.value.value"
                      @update:organ="form.context.setFieldValue('owner', $event)"
                      :errors="form.context.errors.value.owner"
                      :disabled="!isOrganEditable || !isEditable"/>

    </div>

    <div class="flex flex-column justify-content-between gap-1">
      <InputSpan
          :label="t('c_productContainerOperations.Preferred')"
          :value="form.model.preferred.value.value"
          :attributes="form.model.preferred.attr.value"
          @update:value="form.context.setFieldValue('preferred', $event)"
          :errors="form.context.errors.value.preferred"
          id="preferred" type="boolean"
          :disabled="!isEditable"/>
      <InputSpan
          :label="t('c_productContainerOperations.Featured')"
          :value="form.model.featured.value.value"
          :attributes="form.model.featured.attr.value"
          @update:value="form.context.setFieldValue('featured', $event)"
          :errors="form.context.errors.value.featured"
          id="featured" type="boolean"
          :disabled="!isEditable"/>
      <InputSpan
          :label="t('c_productContainerOperations.Pricelist')"
          :value="form.model.priceList.value.value"
          :attributes="form.model.priceList.attr.value"
          @update:value="form.context.setFieldValue('priceList', $event)"
          :errors="form.context.errors.value.priceList"
          id="priceList" type="boolean"
          :disabled="!isEditable"/>
    </div>
  </div>
</template>
<script setup lang="ts">
import InputSpan from "@/components/InputSpan.vue";
import type { createProductSchema } from "@/utils/validation-schema";
import { type Form } from "@/utils/formUtils";
import * as yup from "yup";
import InputOrganSpan from "@/components/InputOrganSpan.vue";
import InputDropdownSpan from "@/components/InputDropdownSpan.vue";
import type { BaseVatGroupResponse, ProductCategoryResponse, ProductResponse } from "@sudosos/sudosos-client";
import { ref, watch } from "vue";
import Fuse from "fuse.js";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  form: Form<yup.InferType<typeof createProductSchema>>,
  productCategories: ProductCategoryResponse[],
  vatGroups: BaseVatGroupResponse[],
  products?: ProductResponse[],
  isEditable?: boolean,
  isOrganEditable?: boolean
}>();

console.log(props.isOrganEditable);

const selectExistingProduct = defineModel('existingProduct');

// Give user a warning if making possible duplicate product
const closeTo = ref<ProductResponse | null>(null);
watch(props.form.model.name.value, () => {
  if (selectExistingProduct.value) return;
  if (!props.form.model.name.value.value) return;
  if (!props.products) return;


  const fuse = new Fuse(props.products, {
    keys: ['name'],
    includeScore: true,
    threshold: 0.3
  });

  // Search for products with a similar name
  const results = fuse.search(props.form.model.name.value.value);

  // If a similar product is found, update the 'similar' value
  const closest = results[0];
  if (!closest) {
    closeTo.value = null;
    return;
  };
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
