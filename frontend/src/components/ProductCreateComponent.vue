<template>
  <Dialog v-model:visible="visible" :header="$t('manageProducts.Add product')">
    <div class="dialog">
      <form @submit="handleProductCreate">
        <div class="row">
          <p class="prop">{{ $t('c_productInfoModal.Name') }}</p>
          <InputText v-bind="name" />
          <span class="error-text">{{ errors.name }}</span>
        </div>
        <div class="row">
          <p class="prop">{{ $t('c_productInfoModal.Category') }}</p>
          <Dropdown
            :placeholder="$t('c_productEditModal.Please select')"
            :options="categories"
            optionLabel="name"
            v-bind="category"
          />
          <span class="error-text">{{ errors.category }}</span>
        </div>
        <div class="row">
          <p class="prop">{{ $t('c_productEditModal.VAT') }}</p>
          <Dropdown
            :placeholder="$t('c_productEditModal.Please select VAT')"
            :options="vatGroups"
            optionLabel="percentage"
            v-bind="vat"
          />
          <span class="error-text">{{ errors.vatGroup }}</span>
        </div>
        <div class="row" v-if="category.modelValue && category.modelValue.name === 'Alcoholic'">
          <p class="prop">{{ $t('c_productEditModal.Alcohol Percentage') }}</p>
          <InputNumber placeholder="" :options="vatGroups" v-bind="alcoholPercentage" />
          <span class="error-text">{{ errors.alcoholPercentage }}</span>
        </div>
        <div class="row">
          <p class="prop">{{ $t('c_productEditModal.Price') }}</p>
          <InputNumber placeholder="" v-bind="price" />
          <span class="error-text">{{ errors.price }}</span>
        </div>
        <div class="row">
          <p class="prop">{{ $t('c_productEditModal.Image') }}</p>
          <FileUpload mode="basic" name="productImg" accept="image/*" @select="onImgUpload($event)" />
        </div>
        <div class="row">
          <p class="prop">{{ $t('c_POSCreate.Owner') }}</p>
          <Dropdown
            :placeholder="$t('c_POSCreate.Select owner')"
            :options="organsList"
            optionLabel="firstName"
            v-bind="owner"
          />
          <span class="error-text">{{ errors.owner }}</span>
        </div>
        <div class="button-row">
          <Button type="submit" severity="danger" class="save-button">{{ $t('c_productEditModal.save') }}</Button>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import type {
  BaseUserResponse,
  CreateProductRequest,
  ProductCategoryResponse,
  ProductResponse,
  VatGroup
} from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import InputNumber from 'primevue/inputnumber';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { handleError } from "@/utils/errorUtils";

const productSchema = toTypedSchema(
  yup.object({
    name: yup.string().required(),
    category: yup.mixed<ProductCategoryResponse>().required(),
    vatGroup: yup.mixed<VatGroup>().required(),
    alcoholPercentage: yup.number(),
    price: yup.number().required(),
    owner: yup.mixed<BaseUserResponse>().required()
  })
);

const { defineComponentBinds, handleSubmit, errors } = useForm({
  validationSchema: productSchema
});

const authStore = useAuthStore();
defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: false
  }
});
const toast = useToast();
const { t } = useI18n();
const visible = ref(false);
const categories: Ref<ProductCategoryResponse[]> = ref([]);
const vatGroups: Ref<VatGroup[]> = ref([]);
const organsList: Ref<BaseUserResponse[]> = ref([]);
const name = defineComponentBinds('name');
const category = defineComponentBinds('category');
const vat = defineComponentBinds('vatGroup');
const price = defineComponentBinds('price');
const owner = defineComponentBinds('owner');
const alcoholPercentage = defineComponentBinds('alcoholPercentage');
const productImage: Ref<File | undefined> = ref();

onMounted(async () => {
  const categoriesResp = await apiService.category.getAllProductCategories();
  // I'm gonna go ahead and hardcode this because
  // if there are more than 25 fucking categories we are doing something wrong.
  categories.value = categoriesResp.data.records;
  const vatGroupsResp = await apiService.vatGroups.getAllVatGroups();
  vatGroups.value = vatGroupsResp.data.records;
  organsList.value = authStore.organs;
});

const handleProductCreate = handleSubmit(async (values) => {
  const createProductRequest: CreateProductRequest = {
    name: values.name,
    priceInclVat: {
      amount: values.price * 100,
      currency: 'EUR',
      precision: 2
    },
    vat: values.vatGroup.id,
    category: values.category.id,
    alcoholPercentage: values.alcoholPercentage || 0,
    ownerId: values.owner.id
  };
  await apiService.products.createProduct(createProductRequest).then((resp) => {
    if (productImage.value)
      apiService.products.updateProductImage(resp.data.id, productImage.value);
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.productCreated'),
      life: 3000,
    });
  }).catch((err) => handleError(err, toast));
});

const onImgUpload = (event: any) => {
  //@ts-ignore
  productImage.value = event.files[0];
};
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
}

.row {
  display: flex;
  flex-direction: row;
  margin: 0.5rem 0;
  align-items: center;
}

.prop {
  width: 20%;
  font-weight: 700 !important;
  font-family: Lato, Arial, sans-serif !important;
  font-size: 1rem !important;
}

.dialog {
  width: 50vw;
}

.save-button {
  width: fit-content;
}
.button-row {
  display: flex;
  flex-direction: row-reverse;
}
</style>
