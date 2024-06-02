<template>
  <div class="mt-1">
    <div class="flex-container mb-2">
      <img :id="product.name" :src="getProductImageSrc(product)" :alt="product.name" class="product-image image me-2" />
      <div class>
        <h4 class="fs-6 text-overflow fw-bolder" style="max-width: 100px;">{{ product.name }}</h4>
        <p class="font-size-sm">{{ product.category.name }}</p>
      </div>
      <div class="ms-auto gap-2 flex-container">
        <button class="c-btn active squarer min-w-34" @click="decreaseQuantity">-</button>
        <span class="min-w-24 text-center fw-bolder">{{ cartProduct.count }}</span>
        <button class="c-btn active squarer min-w-34" @click="increaseQuantity">+</button>
      </div>
      <p class="min-w-70 fw-bolder ps-3 text-end fs-6">€{{ totalPrice }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CartProduct, useCartStore } from '@/stores/cart.store';
import { getProductImageSrc } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/FormatUtils';
import { ProductResponse } from "@sudosos/sudosos-client";

const cartStore = useCartStore();

const props = defineProps({
  cartProduct: {
    type: Object as () => CartProduct,
    required: true
  }
});

const product = ref<ProductResponse>(props.cartProduct.product);
const decreaseQuantity = () => {
  cartStore.removeFromCart(props.cartProduct);
};

const increaseQuantity = () => {
  cartStore.addToCart({ ...props.cartProduct, count: 1 });
};

const totalPrice = computed(() => {
  const price = product.value.priceInclVat.amount * props.cartProduct.count;
  return formatPrice(price);
});
</script>

<style scoped lang="scss">
button {
  font-size: $font-size-lg;
}
</style>
