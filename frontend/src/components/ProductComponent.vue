<template>
  <div class="text-center product-card" :class="{pulsing}">
    <div class="product">
      <img :src="image" :alt="product.name" @click="addToCart"/>
      <p class="product-name text-overflow font-size-md fw-bold">{{ product.name }}</p>
      <p class="product-price font-size-sm">€{{ productPrice }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContainerWithProductsResponse, ProductResponse } from '@sudosos/sudosos-client';
import { useCartStore } from '@/stores/cart.store';
import { getProductImageSrc } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/FormatUtils';
import { ref } from "vue";

const pulsing = ref(false);

const props = defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true
  },
  container: {
    type: Object as () => ContainerWithProductsResponse,
    required: true
  }
});

const image = getProductImageSrc(props.product);
const productPrice = formatPrice(props.product?.priceInclVat.amount);

const cartStore = useCartStore();
const addToCart = () => {
  pulsing.value = true;

  setTimeout(() => {
    pulsing.value = false;
  }, 500);

  cartStore.addToCart({
    product: props.product,
    container: props.container,
    count: 1
  });
};
</script>

<style scoped lang="scss">
.product-card {
  padding: 0 0 8px 0;
  height: fit-content;
  border-radius: $border-radius;
  overflow: hidden;
  width: var(--product-card-width);
  text-align: center;

  .product {
    > img {
      width: $product-card-size;
      height: $product-card-size;
      background-color: $gewis-grey-light;
      border-top-left-radius: $border-radius;
      border-top-right-radius: $border-radius;
      object-fit: contain;
    }
  }

  &.pulsing {
    animation: pulse 0.5s infinite;
  }
}

.product-name {
  margin-bottom: -5px;
}

.product-price {
  height: $product-price-height;
}

@keyframes pulse {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
