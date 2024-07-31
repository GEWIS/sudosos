<template>
  <Dialog v-model:visible="visible"
          :header="header"
          :draggable="false"
          modal
          @update:visible="closeDialog"
          :close-on-escape="true"
          ref="dialog"
          @show="openDialog"
  >
    <div class="flex flex-column gap-3">
      <div class="flex gap-5 justify-content-end" v-if="state.addToContainer">
        <p class="prop">{{ $t('c_productContainerOperations.Existing Product') }}</p>
        <Dropdown
            :placeholder="$t('c_ContainerAssign.Select product')"
            :options="dropdownProducts"
            optionLabel="name"
            v-model="selectProduct"
            :filter="true"
            class="w-15rem align-items-center"
        />
      </div>
      <hr class="w-full opacity-50" v-if="state.addToContainer">
      <div class="flex gap-5 align-items-center justify-content-center flex-wrap" :class="!edit ? 'opacity-50':''">
        <div class="flex flex-column align-items-center gap-3">
          <div class="picture-container p-3">
            <img v-if="imageSrc" class="product-image" :src="imageSrc">
            <img v-else class="product-image" src="@/assets/img/bier.png">
          </div>
          <div v-if="edit">
            <FileUpload id="img" mode="basic" name="productImg" accept="image/*" @select="onImgUpload($event)"/>
          </div>
        </div>

        <div class="flex flex-column justify-content-between pr-5 py-5 gap-3">
          <div class="flex flex-row flex-wrap justify-content-between align-items-center">
            <label for="name" class="mr-8">{{ $t('c_productContainerOperations.Name') }}</label>
            <div class="relative mb-3">
              <InputText id="name" class="w-18rem" v-model="name" type="text" v-bind="nameAttrs" :disabled="!edit"/>
              <br>
              <span class="error-text-name block w15-rem" v-if="closeTo && !errors.name" @click="selectCloseTo">
                {{ $t('c_productContainerOperations.Close To', {name: closeTo.name}) }}</span>
              <error-span :error="errors.name"/>
            </div>
          </div>
          <div class="flex flex-row flex-wrap justify-content-between align-items-center">
            <label for="category" class="mr-8">{{ $t('c_productContainerOperations.Category') }}</label>
            <div class="relative mb-3">
              <Dropdown :placeholder="$t('c_productContainerOperations.Please select')"
                        :options="categories" optionLabel="name" v-model="category" class="w-18rem" id="category"
                        v-bind="categoryAttrs" :disabled="!edit"/>
              <error-span :error="errors.category"/>
            </div>
          </div>
          <div class="flex flex-row flex-wrap justify-content-between align-items-center">
            <label for="vat" class="mr-8">{{ $t('c_productContainerOperations.VAT') }}</label>
            <div class="relative mb-3">
              <Dropdown :placeholder="$t('c_productContainerOperations.Please select VAT')" :options="vatGroups"
                        :optionLabel="(v: VatGroupResponse) => `${v.percentage}`" class="w-18rem" v-model="vat"
                        v-bind="vatAttrs" :disabled="!edit" @change="markVatEdited()"/>
              <error-span :error="errors.vatGroup"/>
            </div>
          </div>
          <div class="flex flex-row flex-wrap justify-content-between align-items-center">
            <label for="alcohol" class="mr-8">{{
                $t('c_productContainerOperations.Alcohol Percentage')
              }}</label>
            <div class="flex flex-column flex-end relative mb-3">
              <InputNumber id="alcohol" class="w-18rem" v-model="alcoholPercentage" v-bind="alcoholPercentageAttrs"
                           :max-fraction-digits="2" :disabled="!edit || (!category || category.name !== 'Alcoholic')"/>
              <error-span :error="errors.alcoholPercentage"/>
            </div>
          </div>
          <div class="flex flex-row flex-wrap justify-content-between align-items-center">
            <label for="price" class="mr-8">{{ $t('c_productContainerOperations.Price') }}</label>
            <div class="flex flex-column flex-end relative mb-3">
              <InputNumber id="price" class="w-18rem" v-model="price" v-bind="priceAttrs" :max-fraction-digits="2"
                           :disabled="!edit"/>
              <error-span :error="errors.price"/>
            </div>
          </div>
          <div v-if="!state.displayProduct" class="flex flex-row flex-wrap justify-content-between align-items-center">
            <label for="owner" class="mr-8">
              <i class="pi pi-exclamation-circle text-red-500 cursor-pointer"
                 v-tooltip.top="$t('tooltip.owner_revenue')"/>
              {{ $t('c_POSCreate.Owner') }}
            </label>
            <div class="flex flex-column flex-end relative mb-3">
              <Dropdown :placeholder="$t('c_POSCreate.Select owner')" :options="organsList" optionLabel="firstName"
                        v-model="owner" class="w-18rem" id="owner" v-bind="ownerAttrs" :disabled="!edit"/>
              <error-span :error="errors.owner"/>
            </div>
          </div>

          <div class="flex flex-row flex-wrap justify-content-between align-items-center">
            <div>
              <div class="flex flex-row flex-start mb-3">
                <label for="price" class="mr-2">{{ $t('c_productContainerOperations.Preferred') }}</label>
                <Checkbox v-model="preferred" v-bind="preferredAttrs"
                          name="preferred" value="preferred" :binary="true"/>
              </div>
            </div>
            <div>
              <div class="flex flex-row flex-start mb-3">
                <label for="price" class="mr-2">{{ $t('c_productContainerOperations.Featured') }}</label>
                <Checkbox v-model="featured" v-bind="featuredAttrs"
                          name="featured" value="featured" :binary="true"/>
              </div>
            </div>
            <div>
              <div class="flex flex-row flex-start mb-3">
                <label for="price" class="mr-2">{{ $t('c_productContainerOperations.Pricelist') }}</label>
                <Checkbox v-model="priceList" v-bind="priceListAttrs"
                          name="priceList" value="priceList" :binary="true"/>
              </div>
            </div>
          </div>

          <!-- Row for Added on -->
          <div v-if="state.displayProduct" class="flex flex-row flex-wrap justify-content-between">
            <h4 class="my-0">{{ $t("c_productContainerOperations.Added on") }}</h4>
            <p class="my-0" v-if="product">
              {{ formatDateTime(new Date(product.createdAt ? product.createdAt.toString() : '')) }}</p>
          </div>

          <!-- Row for Updated on -->
          <div v-if="state.displayProduct" class="flex flex-row flex-wrap justify-content-between">
            <h4 class="my-0">{{ $t("c_productContainerOperations.Updated on") }}</h4>
            <p class="my-0" v-if="product">
              {{ formatDateTime(new Date(product.updatedAt ? product.updatedAt.toString() : '')) }}</p>
          </div>

          <!-- Row for Created by -->
          <div v-if="state.displayProduct" class="flex flex-row flex-wrap justify-content-between">
            <h4 class="my-0">{{ $t("c_productContainerOperations.Owner") }}</h4>
            <p class="my-0" v-if="product">
              {{ product.owner.firstName + ' ' + product.owner.lastName }}</p>
          </div>
        </div>
      </div>
      <div class="flex justify-content-end" v-if="state.addToContainer">
        <Button type="submit" class="save-button" disabled v-if="inContainer">
          {{ $t("c_productContainerOperations.Already In") }}
        </Button>
        <Button type="submit" class="save-button" v-else @click="handleProductAdd()">
          {{ $t("c_productContainerOperations.Add To Container") }}
        </Button>
      </div>
      <div class="flex justify-content-between" v-if="state.displayProduct && container !== undefined">
        <Button type="submit" class="save-button" @click="handleDeleteContainerProduct()">
          {{ $t("c_productContainerOperations.Delete From Container") }}
        </Button>
        <Button type="submit" class="save-button" @click="handleSaveProduct()">
          {{ $t("c_productContainerOperations.Save") }}
        </Button>
      </div>
      <div class="flex justify-content-end" v-if="state.displayProduct && container === undefined">
        <Button type="submit" class="save-button" @click="handleSaveProduct()">
          {{ $t("c_productContainerOperations.Save") }}
        </Button>
      </div>
      <div class="flex justify-content-end" v-if="state.createProduct">
        <Button type="submit" class="save-button" @click="handleProductAdd()">
          {{ $t("c_productContainerOperations.Create") }}
        </Button>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, type ComputedRef, onBeforeMount, type PropType, type Ref, ref, watch } from "vue";
import type {
  BaseUserResponse,
  ContainerWithProductsResponse, CreateProductRequest,
  ProductCategoryResponse,
  ProductResponse, UpdateProductRequest,
  VatGroupResponse
} from "@sudosos/sudosos-client";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import Dialog from "primevue/dialog";
import { useProductStore } from "@/stores/product.store";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { useForm } from "vee-validate";
import { getProductImageSrc } from "@/utils/imageUtils";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import { useContainerStore } from "@/stores/container.store";
import Fuse from "fuse.js";
import FileUpload from "primevue/fileupload";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { formatDateTime } from "@/utils/formatterUtils";
import ErrorSpan from "@/components/ErrorSpan.vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import { handleError } from "@/utils/errorUtils";
const { t } = useI18n();
const toast = useToast();

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
  },
  product: {
    type: Object as PropType<ProductResponse | undefined>,
  },
});

const creationSchema = toTypedSchema(
    yup.object({
      name: yup.string().required(),
      category: yup.mixed<ProductCategoryResponse>().required(),
      vatGroup: yup.mixed<VatGroupResponse>().required(),
      alcoholPercentage: yup.number(),
      price: yup.number().required(),
      owner: yup.mixed<BaseUserResponse>().required(),
      preferred: yup.boolean().required().default(false),
      featured: yup.boolean().required().default(false),
      priceList: yup.boolean().required().default(false),
    })
);

const { defineField, resetForm, errors, handleSubmit } = useForm({
  validationSchema: creationSchema,
});

const selectProduct = ref<ProductResponse | undefined>(undefined);
const [name, nameAttrs] = defineField('name');
const [category, categoryAttrs] = defineField('category');
const [vat, vatAttrs] = defineField('vatGroup');
const [price, priceAttrs] = defineField('price');
const [owner, ownerAttrs] = defineField('owner');
const [preferred, preferredAttrs] = defineField('preferred');
const [featured, featuredAttrs] = defineField('featured');
const [priceList, priceListAttrs] = defineField('priceList');
const [alcoholPercentage, alcoholPercentageAttrs] = defineField('alcoholPercentage');

const dialog: Ref<null | any> = ref(null);
const visible = ref(false);
const emit = defineEmits(['update:visible']);

// Load Stores
const productStore = useProductStore();
const containerStore = useContainerStore();
const authStore = useAuthStore();

// List products to insta-add
const dropdownProducts = computed(() => {
  const c = props.container;
  if (!c) return products.value;
  // Ignore products that are already in the container
  return products.value.filter((p) => !c.products.map((p) => p.id).includes(p.id));
});


// When using the "alike product", disable add button if its already in container.
const inContainer = computed(() => {
  if (!props.container) return false;
  return props.container.products.map((p) => p.id).includes(selectProduct.value?.id as number);
});

// Deep reactivity
const categories: ComputedRef<ProductCategoryResponse[]> = computed(() => Object.values(productStore.categories));
const vatGroups: ComputedRef<VatGroupResponse[]> = computed(() => Object.values(productStore.vatGroups));
const products: ComputedRef<ProductResponse[]> = computed(() => Object.values(productStore.getAllProducts));
const organsList: Ref<BaseUserResponse[]> = ref(authStore.organs);

// We don't allow editing of dropdown products
const edit = computed(() => selectProduct.value == null);

const header = computed(() => {
  if (state.value.addToContainer) return t('c_productContainerOperations.header.addProductToContainer');
  if (state.value.createProduct) return t('c_productContainerOperations.header.createProduct');
  if (state.value.displayProduct) return t('c_productContainerOperations.header.productDetails');
  return '';
});

const productImage: Ref<File | undefined> = ref();
const imageSrc = ref('');

// Smart automatic VAT percentage
const vatMap: { [key: string | number]: any } = {
  other: undefined,
  modified: false,
};

const markVatEdited = () => {
  vatMap.edited = true;
};

watch(category, () => {
  if (vatMap.edited) return;

  if (!category.value || !category.value.id) return;
  const vatMapped = vatMap[category.value.id];
  if (vatMapped) vat.value = vatMapped;
  else if (vatMap.other) vat.value = vatMap.other;
});

// Current state / operations
const state = computed(() => {
  return {
    addToContainer: props.container != undefined && props.product == undefined,
    createProduct: props.container == undefined && props.product == undefined,
    displayProduct: props.product != undefined,
  };
});

watch(selectProduct, () => {
  if (selectProduct.value) updateFieldValues(selectProduct.value);
});

const updateFieldValues = (p: ProductResponse) => {
  if (!p) return;
  name.value = p.name;
  category.value = categories.value.find((c) => c.id == p.category.id);
  vat.value = vatGroups.value.find((c) => c.id == p.vat.id);
  price.value = p.priceInclVat.amount / 100;
  owner.value = organsList.value.find((o) => o.id == p.owner.id);
  alcoholPercentage.value = p.alcoholPercentage;
  preferred.value = p.preferred;
  featured.value = p.featured;
  priceList.value = p.priceList;
  imageSrc.value = getProductImageSrc(p);
};

// Give user a warning if making possible duplicate product
const closeTo = ref<ProductResponse | null>(null);
watch(name, () => {
  if (selectProduct.value) return;
  if (!name.value) return;

  const fuse = new Fuse(products.value, {
    keys: ['name'],
    includeScore: true,
    threshold: 0.3
  });

  // Search for products with a similar name
  const results = fuse.search(name.value);

  // If a similar product is found, update the 'similar' value
  const closest = results[0];
  if (closest.score && results.length > 0 && closest.score < 0.3) {
    if (props.product && closest.item.id === props.product.id ) {
      closeTo.value = null;
    } else {
      closeTo.value = results[0].item;
    }
  } else {
    closeTo.value = null;
  }
});

const selectCloseTo = () => {
  if (!closeTo.value) return;
  selectProduct.value = closeTo.value;
  closeTo.value = null;
};

// Load all product information once
onBeforeMount(async () => {
  await productStore.fetchAllIfEmpty();

  const alcoholic = categories.value.find((c) => c.name === 'Alcoholic');
  if (alcoholic) {
    vatMap[alcoholic.id] = vatGroups.value.find((v) => v.name === 'BTW Hoog');
    vatMap.other = vatGroups.value.find((v) => v.name === 'BTW Laag');
  }
});

const onProductAddSuccess = () => {
  toast.add({
    severity: 'success',
    summary: t('successMessages.success'),
    detail: t('successMessages.productContainerAdd'),
    life: 3000,
  });
  closeDialog();
};

const handleProductAdd = async () => {
  // Add predefined product
  if (props.container && selectProduct.value && !edit.value) {
    await containerStore.addProductToContainer(props.container, selectProduct.value as ProductResponse).then(() => {
      onProductAddSuccess();
    }).catch((err) => handleError(err, toast));
  }
  // Create an add new product
  else if (edit.value && !selectProduct.value) {
    await handleSubmit(async (values) => {
      const createProductRequest: CreateProductRequest = {
        name: values.name,
        priceInclVat: {
          amount: Math.round(values.price * 100),
          currency: 'EUR',
          precision: 2
        },
        vat: values.vatGroup.id,
        category: values.category.id,
        alcoholPercentage: values.alcoholPercentage || 0,
        ownerId: values.owner.id,
        featured: values.featured,
        preferred: values.preferred,
        priceList: values.priceList,
      };

      await productStore.createProduct(createProductRequest, productImage.value)
          .then((createdProduct: ProductResponse) => {
            // Propagate product to container
            if (props.container) containerStore.addProductToContainer(props.container, createdProduct);
          }).then(() => {
            if (props.container) onProductAddSuccess();
            else {
              toast.add({
                severity: 'success',
                summary: t('successMessages.success'),
                detail: t('successMessages.productCreate'),
                life: 3000,
              });
              closeDialog();
            }
          }).catch((err) => handleError(err, toast));
    })();
  }
};

const changed = () => {
  if (props.product == undefined) return;
  return name.value !== props.product.name ||
      category.value?.id !== props.product.category.id ||
      vat.value?.id !== props.product.vat.id ||
      price.value !== props.product.priceInclVat!.amount / 100 ||
      preferred.value !== props.product.preferred ||
      featured.value !== props.product.featured ||
      priceList.value !== props.product.priceList ||
      alcoholPercentage.value !== props.product.alcoholPercentage;
};

const handleSaveProduct = async () => {
  if (!state.value.displayProduct) return;

  if (productImage.value && props.product) {
    await productStore.updateProductImage(props.product.id, productImage.value);
  }

  if (changed()) {
    await handleSubmit(async () => {
      const updateProductRequest: UpdateProductRequest = {
        alcoholPercentage: alcoholPercentage.value as number,
        category: category.value?.id as number,
        featured: featured.value,
        name: name.value as string,
        preferred: preferred.value,
        priceInclVat: {
          amount: Math.round(price.value as number * 100),
          currency: 'EUR',
          precision: 2
        },
        priceList: priceList.value,
        vat: vat.value?.id as number,
      };
      if (!props.product) return;
      await productStore.updateProduct(props.product.id, updateProductRequest);
    })().then(() => {
      toast.add({
        severity: 'success',
        summary: t('successMessages.success'),
        detail: t('successMessages.productUpdate'),
        life: 3000,
      });
    }).catch((err) => handleError(err, toast));
  }

  closeDialog();
};

const handleDeleteContainerProduct = async () => {
  if (!props.container || !props.product) return;
  await containerStore.deleteProductFromContainer(props.container, props.product).then(() => {
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.productContainerDelete'),
      life: 3000,
    });
    closeDialog();
  }).catch((err) => handleError(err, toast));
};

const openDialog = () => {
  addListenerOnDialogueOverlay(dialog.value);
  selectProduct.value = undefined;
  if (props.product) {
    updateFieldValues(props.product);
    vatMap.edited = true;
  }
};

const closeDialog = () => {
  resetForm();
  imageSrc.value = '';
  selectProduct.value = undefined;
  productImage.value = undefined;
  closeTo.value = null;
  vatMap.edited = false;
  emit('update:visible', false);
};

const onImgUpload = (event: any) => {
  //@ts-ignore
  productImage.value = event.files[0];
  imageSrc.value = URL.createObjectURL(event.files[0]);
};

</script>

<style scoped lang="scss">
.alt-dialog-content {
  padding: 0 !important;
}

.picture-container {
  width: 21rem;
  height: 21rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: 100%;
  object-fit: cover;
}

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
