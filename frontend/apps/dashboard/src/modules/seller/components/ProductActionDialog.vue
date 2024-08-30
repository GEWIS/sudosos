<template>
  <FormDialog v-model="visible"
              :form="form"
              :header="header"
              @show="openDialog()"
              @close="closeDialog()"
              @delete="deleteProduct()"
              :deletable="product != null"
              :delete-label="deleteLabel"
  >
    <template #form>
      <div class="flex flex-column gap-1">
        <ProductActionExistingProductForm
            v-if="state.addToContainer"
            v-model:select-product="selectExistingProduct"
            :products="dropdownProducts"/>
        <hr class="w-full opacity-50" v-if="state.addToContainer">
        <div class="flex flex-column md:flex-row gap-4">
          <ProductActionImageForm
              :image-src="imageSrc"
              @upload="onImageUpload($event)"
              :isEditable="isProductEditable"
          />
          <div class="flex flex-column gap-3">
            <ProductActionForm
                :form="form"
                @submit:success="visible = false"
                :product-categories="categories"
                :vat-groups="vatGroups"
                :products="!state.displayProduct ? products : undefined"
                v-model:existing-product="selectExistingProduct"
                :is-editable="isProductEditable"
                :is-organ-editable="state.createProduct || (state.addToContainer && isProductEditable)"/>
            <div class="flex flex-row justify-content-end gap-1">
            </div>
            <div>
              <!-- Row for Added on -->
              <div v-if="state.displayProduct" class="flex flex-row flex-wrap justify-content-between">
                <h4 class="my-0">{{ t("c_productContainerOperations.Added on") }}</h4>
                <p class="my-0" v-if="product">
                  {{ formatDateTime(new Date(product.createdAt ? product.createdAt.toString() : '')) }}</p>
              </div>

              <!-- Row for Updated on -->
              <div v-if="state.displayProduct" class="flex flex-row flex-wrap justify-content-between">
                <h4 class="my-0">{{ t("c_productContainerOperations.Updated on") }}</h4>
                <p class="my-0" v-if="product">
                  {{ formatDateTime(new Date(product.updatedAt ? product.updatedAt.toString() : '')) }}</p>
              </div>
            </div>
          </div>
        </div>
        <ConfirmDialog ref="deleteConfirm"></ConfirmDialog>
      </div>
    </template>
  </FormDialog>
</template>

<script setup lang="ts">

import {
  computed,
  type ComputedRef,
  type PropType,
  ref,
  type Ref, watch
} from "vue";
import type {
  BaseUserResponse,
  ContainerWithProductsResponse, CreateProductRequest,
  ProductCategoryResponse,
  ProductResponse, UpdateProductRequest,
  VatGroupResponse
} from "@sudosos/sudosos-client";
import { schemaToForm, setSubmit } from "@/utils/formUtils";
import { createProductSchema } from "@/utils/validation-schema";
import FormDialog from "@/components/FormDialog.vue";
import ProductActionForm from "@/modules/seller/components/ProductActionForm.vue";
import { useProductStore } from "@/stores/product.store";
import { useContainerStore } from "@/stores/container.store";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { useI18n } from "vue-i18n";
import ProductActionImageForm from "@/modules/seller/components/ProductActionImageForm.vue";
import ProductActionExistingProductForm from "@/modules/seller/components/ProductActionExistingProductForm.vue";
import { getProductImageSrc } from "@/utils/urlUtils";
import apiService from "@/services/ApiService";
import { formatDateTime } from "@/utils/formatterUtils";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
const toast = useToast();
const { t } = useI18n();

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
  },
  product: {
    type: Object as PropType<ProductResponse | undefined>,
  },
});

const visible = defineModel<boolean>('visible', { required: true });

const form = schemaToForm(createProductSchema);

// Load Stores
const productStore = useProductStore();
const containerStore = useContainerStore();
const userStore = useUserStore();

// Deep reactivity
const categories: ComputedRef<ProductCategoryResponse[]> = computed(() => Object.values(productStore.categories));
const vatGroups: ComputedRef<VatGroupResponse[]> = computed(() => Object.values(productStore.vatGroups));
const products: ComputedRef<ProductResponse[]> = computed(() => Object.values(productStore.getAllProducts));
const organsList: ComputedRef<BaseUserResponse[]> = computed(() => userStore.organs);

// List products to insta-add
const dropdownProducts = computed(() => {
  const c = props.container;
  if (!c) return products.value;
  // Ignore products that are already in the container
  return products.value.filter((p) => !c.products.map((p) => p.id).includes(p.id));
});

// Smart automatic VAT percentage
const vatMap: { [key: string | number]: any } = {
  other: undefined,
  modified: false,
};

const markVatEdited = () => {
  vatMap.edited = true;
};

watch(form.model.category.value, () => {
  if (vatMap.edited) return;

  if (!form.model.category.value.value || !form.model.category.value.value.id) return;
  const vatMapped = vatMap[form.model.category.value.value.id];
  if (vatMapped) form.model.vat.value.value = vatMapped;
  else if (vatMap.other) form.model.vat.value.value = vatMap.other;
});

watch(form.model.vat.value, markVatEdited);

// Handle image upload
const productImage: Ref<File | undefined> = ref();
const imageSrc = ref<string>();
function onImageUpload(image: File) {
  productImage.value = image;
  imageSrc.value = URL.createObjectURL(image);
}

const updateFieldValues = (p: ProductResponse) => {
  if (!p) return;
  const name = p.name;
  const category = categories.value.find((c) => c.id == p.category.id);
  const vat = vatGroups.value.find((c) => c.id == p.vat.id);
  const priceInclVat = p.priceInclVat.amount / 100;
  const owner = organsList.value.find((o) => o.id == p.owner.id);
  const alcoholPercentage = p.alcoholPercentage;
  const preferred = p.preferred;
  const featured = p.featured;
  const priceList = p.priceList;
  form.context.resetForm({
    values: {
      name,
      category,
      vat,
      priceInclVat,
      owner,
      alcoholPercentage,
      preferred,
      featured,
      priceList
    }
  });

  productImage.value = undefined;
  imageSrc.value = getProductImageSrc(p);

};

// Current state / operations
const state = computed(() => {
  return {
    addToContainer: props.container != undefined && props.product == undefined,
    createProduct: props.container == undefined && props.product == undefined,
    displayProduct: props.product != undefined,
  };
});

// Generate the correct header for the Dialog
const header = computed(() => {
  if (state.value.addToContainer) return t('c_productContainerOperations.header.addProductToContainer');
  if (state.value.createProduct) return t('c_productContainerOperations.header.createProduct');
  if (state.value.displayProduct) return t('c_productContainerOperations.header.productDetails');
  return '';
});

// Handle selecting existing product
const selectExistingProduct = ref<ProductResponse | undefined>(undefined);
watch(selectExistingProduct, () => {
  if (selectExistingProduct.value) updateFieldValues(selectExistingProduct.value);
});

// We don't allow editing of dropdown products
const isProductEditable = computed(() => selectExistingProduct.value == null);

setSubmit(form, form.context.handleSubmit(async (values) => {
  let createdProduct;

  // Create a new product
  if(
      (state.value.createProduct ||
      state.value.addToContainer) && selectExistingProduct.value == undefined) {
    const createProductRequest: CreateProductRequest = {
      name: values.name,
      priceInclVat: {
        amount: Math.round(values.priceInclVat * 100),
        currency: 'EUR',
        precision: 2
      },
      vat: values.vat.id,
      category: values.category.id,
      alcoholPercentage: values.alcoholPercentage || 0,
      ownerId: values.owner.id,
      featured: values.featured,
      preferred: values.preferred,
      priceList: values.priceList,
    };

    createdProduct = await productStore.createProduct(createProductRequest, productImage.value)
        .catch((err) => handleError(err, toast));
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.productCreate'),
      life: 3000,
    });

  }

  // Add product to container
  if(state.value.addToContainer && !inContainer.value) {
    if(selectExistingProduct.value) {
      await containerStore.addProductToContainer(props.container!, selectExistingProduct.value);
    } else if(createdProduct) {
      await containerStore.addProductToContainer(props.container!, createdProduct);
    }
  }


  // Update product
  if(state.value.displayProduct) {
    if (form.context.meta.value.dirty) {
      const updateProductRequest: UpdateProductRequest = {
        name: values.name,
        priceInclVat: {
          amount: Math.round(values.priceInclVat * 100),
          currency: 'EUR',
          precision: 2
        },
        vat: values.vat.id,
        category: values.category.id,
        alcoholPercentage: values.alcoholPercentage || 0,
        featured: values.featured,
        preferred: values.preferred,
        priceList: values.priceList,
      };

      await productStore.updateProduct(props.product!.id, updateProductRequest);
      toast.add({
        severity: 'success',
        summary: t('successMessages.success'),
        detail: t('successMessages.productUpdate'),
        life: 3000,
      });
    }
    if(productImage.value) await productStore.updateProductImage(props.product!.id, productImage.value);
  }
  visible.value = false;
  closeDialog();
}));


// Deleting a product from container or in general
const deleteLabel = computed(() => {
  return props.container
  ? t("c_productContainerOperations.Delete From Container") : undefined;
});

const confirm = useConfirm();

const deleteConfirm = ref<HTMLElement | undefined>();
async function deleteProduct() {
  if(props.product == undefined) return;
  if(props.container) {
    await containerStore.deleteProductFromContainer(props.container, props.product).then(() => {
      toast.add({
        severity: 'success',
        summary: t('successMessages.success'),
        detail: t('successMessages.productContainerDelete'),
        life: 3000,
      });
      closeDialog();
    }).catch((err) => handleError(err, toast));
  } else {
    confirm.require({
      message: t('c_productContainerOperations.confirmDelete'),
      target: deleteConfirm.value,
      acceptLabel: t('common.delete'),
      rejectLabel: t('common.close'),
      acceptIcon: 'pi pi-trash',
      rejectIcon: 'pi pi-times',
      accept: async () => {
        await productStore.deleteProduct(props.product!.id)
            .catch((err) => {
              handleError(err, toast);
            });
        toast.add({
          summary: t('successMessages.success'),
          detail: t('successMessages.productDeleted'),
          severity: 'success',
          life: 3000
        });
        closeDialog();
      }
    });
  }
}


// When using the "alike product", disable add button if its already in container.
const inContainer = computed(() => {
  if (!props.container) return false;
  return props.container.products.map((p) => p.id).includes(selectExistingProduct.value?.id as number);
});

const openDialog = async () => {
  await productStore.fetchAllIfEmpty();
  await userStore.fetchAllOrgans(apiService);

  const alcoholic = categories.value.find((c) => c.name === 'Alcoholic');
  if (alcoholic) {
    vatMap[alcoholic.id] = vatGroups.value.find((v) => v.name === 'BTW Hoog');
    vatMap.other = vatGroups.value.find((v) => v.name === 'BTW Laag');
  }
  selectExistingProduct.value = undefined;
  if (props.product) {
    updateFieldValues(props.product);
    vatMap.edited = true;
  }
};


const closeDialog = () => {
  form.context.resetForm({
    values: {
      name: '',
      category: undefined,
      vat: undefined,
      alcoholPercentage: 0,
      priceInclVat: 0,
      owner: undefined,
      preferred: false,
      featured: false,
      priceList: false
    }
  });

  imageSrc.value = '';
  selectExistingProduct.value = undefined;
  productImage.value = undefined;
  vatMap.edited = false;
  visible.value = false;
};



</script>
<style scoped lang="scss">

</style>
