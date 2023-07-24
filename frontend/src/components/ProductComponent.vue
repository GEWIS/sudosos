<template>
  <div class="text-center product-card" @click="addToCart">
    <div class="product">
      <img :src="image" :alt="product.name" />
      <p class="w-100 product-name mb-0">{{ product.name }}</p>
      <p class="w-100 product-price mb-0">€{{ productPrice }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ContainerWithProductsResponse, ProductResponse} from "@sudosos/sudosos-client";
import {useCartStore} from "@/stores/cart.store";
import {getProductImageSrc} from "@/utils/imageUtils";
import {formatPrice} from "@/utils/FormatUtils";

const props = defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  },
  container: {
    type: Object as () => ContainerWithProductsResponse,
    required: true,
  }
});

const image = getProductImageSrc(props.product);
const productPrice = formatPrice(props.product?.priceInclVat.amount);

const cartStore = useCartStore();
const addToCart = () => {
  cartStore.addToCart({
    product: props.product,
    container: props.container,
    count: 1,
  });
};
</script>

<style scoped lang="scss">
.product-card {
  padding: 0 0 8px 0;
  height: fit-content;
  border-radius: $border-radius;
  overflow: hidden;
  width: 128px;
  text-align: center;

  .product {
    > img {
      width: 128px;
      height: 128px;
      background-color: $gewis-grey-light;
      border-top-left-radius: $border-radius;
      border-top-right-radius: $border-radius;
      object-fit: contain;
    }
  }
}

.product-name {
  font-weight: bold;
  font-size: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-price {
  font-size: 13px;
  height: 15px;
}
</style>
