<template>
  <div class="mt-1">
    <div class="flex-1 flex flex-row items-center justify-start mb-2 h-15 min-h-0 max-w-full">
      <img
        :id="listing ? undefined : product.name"
        :alt="product.name"
        class="size-12 object-contain rounded bg-white"
        :src="getProductImageSrc(product)"
      />

      <div class="flex-1 ml-2 min-w-0">
        <h4 class="font-bold truncate">{{ product.name }}</h4>
        <p v-if="listing" class="text-sm">
          €{{ unitPrice }}<template v-if="alcohol"> · {{ alcohol }}</template>
        </p>
        <p v-else class="text-sm">{{ product.category.name }}</p>
      </div>
      <div class="flex items-center gap-1">
        <template v-if="!listing || cartProduct.count > 0">
          <Button
            class="bg-red w-[34px] h-[34px] shadow-sm text-2xl flex items-center justify-center p-0 leading-none cart-button"
            @click="decreaseQuantity"
            >-</Button
          >
          <span class="font-bold w-8 text-center">{{ cartProduct.count }}</span>
        </template>
        <Button
          class="w-[34px] h-[34px] shadow-sm text-2xl flex items-center justify-center p-0 leading-none cart-button"
          @click="increaseQuantity"
          >+</Button
        >
      </div>

      <p v-if="!listing" class="font-bold text-right basis-1/5">€{{ totalPrice }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ProductResponse } from '@gewis/sudosos-client';
import { CartProduct, useCartStore } from '@/stores/cart.store';
import { getProductImageSrc } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/FormatUtils';

const cartStore = useCartStore();

const props = defineProps({
  cartProduct: {
    type: Object as () => CartProduct,
    required: true,
  },
  // A row in a product list rather than a cart line: shows the unit price,
  // and only a + button until the product is in the cart (count > 0).
  listing: {
    type: Boolean,
    default: false,
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

const unitPrice = formatPrice(props.cartProduct.product.priceInclVat.amount);
const alcohol =
  props.cartProduct.product.alcoholPercentage > 0 ? `${props.cartProduct.product.alcoholPercentage}%` : '';
</script>

<style scoped lang="scss">
.cart-button {
  line-height: 0.8 !important;
  min-width: 34px !important;
  min-height: 34px !important;
  font-size: 1.5rem !important;
  padding-bottom: 4px !important;

  &::before,
  &::after {
    content: none !important;
  }
}
</style>
