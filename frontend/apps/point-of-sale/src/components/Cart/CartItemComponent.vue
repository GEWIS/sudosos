<template>
  <div class="mt-1">
    <div class="flex-container gap-1">
      <div class="flex-container">
        <img
          :id="product.name"
          :alt="product.name"
          class="image mr-2 product-image"
          :src="getProductImageSrc(product)"
        />
      </div>
      <div class>
        <h4 class="font-bold m-0 text-base text-overflow w-5rem" style="max-width: 100px">{{ product.name }}</h4>
        <p class="font-size-sm m-0">{{ product.category.name }}</p>
      </div>
      <div class="flex-container gap-2 ml-auto">
        <button class="active c-btn min-w-34 shadow-1 squarer" @click="decreaseQuantity">-</button>
        <span class="font-bold min-w-24 text-center">{{ cartProduct.count }}</span>
        <button class="active c-btn min-w-34 shadow-1 squarer" @click="increaseQuantity">+</button>
      </div>
      <p class="font-bold fs-6 min-w-70 ps-3 text-right">€{{ totalPrice }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ProductResponse } from '@sudosos/sudosos-client';
import { CartProduct, useCartStore } from '@/stores/cart.store';
import { getProductImageSrc } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/FormatUtils';

const cartStore = useCartStore();

const props = defineProps({
  cartProduct: {
    type: Object as () => CartProduct,
    required: true,
  },
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
