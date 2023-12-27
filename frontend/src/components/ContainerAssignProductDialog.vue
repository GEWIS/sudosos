<template>
    <Dialog v-model:visible="visible"
            :header="$t('c_ContainerAssign.Assign product')"
            :draggable="false"
            modal
            @after-hide="resetForm"
    >
        <form @submit="handleProductCreate">
            <div class="row">
                <p class="prop">{{ $t('c_ContainerAssign.Product') }}</p>
                <Dropdown
                    :placeholder="$t('c_ContainerAssign.Select product')"
                    :options="allProducts.filter(prod => !products.map(e => e.id).includes(prod.id))"
                    optionLabel="name"
                    v-bind="productAttrs"
                    v-model="product"
                    editable
                />
                <div class="error-text">{{ errors.product }}</div>
            </div>
            <div class="row">
                <Button type="submit" class="save-button">{{ $t('c_productEditModal.save') }}</Button>
            </div>
        </form>
    </Dialog>

</template>
<script setup lang="ts">
import type { ContainerWithProductsResponse } from "@sudosos/sudosos-client";
import apiService from '@/services/ApiService';
import type { Product, ProductResponse, UpdateContainerRequest } from '@sudosos/sudosos-client';
import Dialog from 'primevue/dialog';
import { onMounted, ref, type PropType, type Ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import { toTypedSchema } from "@vee-validate/yup";
import { computed } from 'vue'
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const schema = toTypedSchema(
  yup.object({
    product: yup.mixed<ProductResponse>()
      .test({
        name: 'unique-product',
        message: (d) => t("c_ContainerAssign.Product selection error"),
        test: (product: ProductResponse | undefined) => product == null || !props.container.products.map(e => e.id).includes(product.id)
      })
      .required(),
  })
)

const { defineField, resetForm, errors, handleSubmit } = useForm({
  validationSchema: schema,
});

const [product, productAttrs] = defineField('product');


const allProducts: Ref<ProductResponse[]> = ref([])


const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
      required: true
  },
  visible: {
    type: Boolean,
    required: true
  },
  products: {
    type: Object as PropType<ProductResponse[]>,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'update:products'])

const products = computed({
  get() {
    return props.products
  },
  set(value) {
    emit('update:products', value)
  }
})

const visible = computed({
  get() {
    return props.visible
  },
  set(value) {
    emit('update:visible', value)
  }
})
onMounted(async () => {

  const productsResp = await apiService.products.getAllProducts(500, 0);
  allProducts.value = productsResp.data.records;
});

const handleProductCreate = handleSubmit(async (values) => {

  const updateContainerReq: UpdateContainerRequest = {
    name: props.container.name,
    products: [values.product.id, ...props.container.products.map(e => e.id)],
    public: props.container.public
  }

  apiService.container.updateContainer(props.container.id, updateContainerReq)

  products.value.push(values.product)

  visible.value = false
});

</script>
<style>
.row {
    margin: 1rem 0;
}

</style>
