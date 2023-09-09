<template>
  <Dialog v-model:visible="visible" header="Add Product">
    <div class="dialog">
      <form>
        <div class="row">
          <p class="prop">Name</p>
          <InputText :placeholder="name" v-model="name"/>
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
        <div class="row">
          <p class="prop">Price (in €)</p>
          <InputText
              placeholder=""
              v-model="price"
          />
        </div>
        <div class="row">
          <p class="prop">Image</p>
          <FileUpload mode="basic"/>
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
import {onMounted, Ref, ref} from 'vue';
import type {
  BaseUserResponse,
  BaseVatGroupResponse,
  DineroObjectResponse,
  ProductCategoryResponse,
  ProductResponse
} from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import Dropdown from "primevue/dropdown";
import FileUpload from "primevue/fileupload";
import {useAuthStore} from "@sudosos/sudosos-frontend-common";

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
const price: Ref<DineroObjectResponse | undefined | null> = ref();
const owner: Ref<BaseUserResponse | undefined | null> = ref();

onMounted(async () => {
  const categoriesResp = await apiService.category.getAllProductCategories();
  // I'm gonna go ahead and hardcode this because if there are more than 25 fucking categories we are doing something wrong.
  categories.value = categoriesResp.data.records;
  const vatGroupsResp = await apiService.vatGroups.getAllVatGroups();
  vatGroups.value = vatGroupsResp.data.records;
  organsList.value = authStore.organs;
});
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
  font-weight: 700!important;
  font-family: Lato,Arial,sans-serif!important;
  font-size: 1rem!important;
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
