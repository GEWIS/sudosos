<template>
  <Dialog v-model:visible="visible" header="Add Product">
    <div class="dialog">
<!--      TODO: Input Validation-->
      <form @submit="handleProductCreate">
        <div class="row">
          <p class="prop">Name</p>
          <InputText :placeholder="name" v-model="name" />
        </div>
        <div class="row">
          <p class="prop">Category</p>
          <Dropdown
            placeholder="Please select a product category"
            :options="categories"
            optionLabel="name"
            v-model="category"
          />
        </div>
        <div class="row">
          <p class="prop">VAT (in %)</p>
          <Dropdown
            placeholder="Please select a VAT group"
            :options="vatGroups"
            optionLabel="percentage"
            v-model="vat"
          />
        </div>
        <div class="row" v-if="category && category.name === 'Alcoholic'">
          <p class="prop">Alcohol Percentage</p>
          <InputNumber placeholder="" :options="vatGroups" v-model="alcoholPercentage" />
        </div>
        <div class="row">
          <p class="prop">Price (in €)</p>
          <InputNumber placeholder="" v-model="price" />
        </div>
        <div class="row">
          <p class="prop">Image</p>
          <FileUpload
            mode="basic"
            name="productImg"
            accept="image/*"
            @select="onImgUpload"
          />
        </div>
        <div class="row">
          <p class="prop">Owner</p>
          <Dropdown
            placeholder="Please select an owner"
            :options="organsList"
            optionLabel="firstName"
            v-model="owner"
          />
        </div>
        <div class="button-row">
          <Button type="submit" severity="danger" class="save-button">Save</Button>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { onMounted, Ref, ref } from 'vue';
import type {
  BaseUserResponse,
  BaseVatGroupResponse,
  DineroObjectResponse,
  ProductCategoryResponse,
  ProductResponse
} from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import Dropdown from 'primevue/dropdown';
import FileUpload, { FileUploadSelectEvent } from 'primevue/fileupload';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import InputNumber from "primevue/inputnumber";

const authStore = useAuthStore();
const props = defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: false
  }
});

const visible = ref(false);
const categories: Ref<ProductCategoryResponse[]> = ref([]);
const vatGroups: Ref<BaseVatGroupResponse[]> = ref([]);
const organsList: Ref<BaseUserResponse[]> = ref([]);
const name = ref('');
const category: Ref<ProductCategoryResponse | undefined | null> = ref();
const vat: Ref<BaseVatGroupResponse | undefined | null> = ref();
const price: Ref<number | undefined> = ref();
const owner: Ref<BaseUserResponse | undefined | null> = ref();
const alcoholPercentage: Ref<number> = ref(0);
const productImage: Ref<File | undefined > = ref();

onMounted(async () => {
  const categoriesResp = await apiService.category.getAllProductCategories();
  // I'm gonna go ahead and hardcode this because if there are more than 25 fucking categories we are doing something wrong.
  categories.value = categoriesResp.data.records;
  const vatGroupsResp = await apiService.vatGroups.getAllVatGroups();
  vatGroups.value = vatGroupsResp.data.records;
  organsList.value = authStore.organs;
});

const handleProductCreate = async (event: Event) => {
  event.preventDefault();
  console.log(typeof(alcoholPercentage.value));
  if(name.value && price.value && vat.value && category.value && !(category.value.name === 'Alcoholic' && !alcoholPercentage.value) && owner.value) {
    apiService.products.createProduct({
      name: name.value,
      priceInclVat: {
        amount: price.value * 100,
        currency: 'EUR',
        precision: 2
      },
      vat: vat.value.id,
      category: category.value.id,
      alcoholPercentage: alcoholPercentage.value,
      ownerId: owner.value.id
    }).then((resp) => {
      console.log(resp);
      if (productImage.value) apiService.products.updateProductImage(resp.data.id, productImage.value );
    });
  }
  console.warn('product created');
};

const onImgUpload = (event: FileUploadSelectEvent) => {
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
