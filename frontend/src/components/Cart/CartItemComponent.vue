<template>
  <div class="cart-item">
    <div class="product">
      <img :src="getProductImageSrc(product)" :alt="product.name" class="product-image" />
      <div class="product-details">
        <h4 class="product-name">{{ product.name }}</h4>
        <p class="product-category">{{ product.category.name }}</p>
      </div>
      <div class="product-actions">
        <button @click="decreaseQuantity">-</button>
        <span class="quantity">{{ cartProduct.count }}</span>
        <button @click="increaseQuantity">+</button>
      </div>
      <p class="total-price">€{{ totalPrice }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CartProduct, useCartStore } from "@/stores/cart.store";
import { getProductImageSrc } from "@/utils/imageUtils";
import { formatPrice } from "@/utils/FormatUtils";

const cartStore = useCartStore();

const props = defineProps({
  cartProduct: {
    type: Object as () => CartProduct,
    required: true,
  },
});

const product = ref(props.cartProduct.product);
const decreaseQuantity = () => {
  cartStore.removeFromCart(props.cartProduct);
};

const increaseQuantity = () => {
  cartStore.addToCart({ ...props.cartProduct, count: 1 });
};

const totalPrice = computed(() => {
  const price = product.value.priceInclVat.amount * props.cartProduct.count
  return formatPrice(price);
});
</script>

<style scoped>
/* Your existing styles */

.cart-item {
  margin-top: 20px;
}

.product {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.product-image {
  width: 52px;
  height: 52px;
  object-fit: cover;
  border-radius: 10px;
  margin-right: 10px;
  background-color: white;
}

.product-details {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 10px;
}

.product-name {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  text-overflow: ellipsis;
  overflow: hidden;
}

.product-category {
  margin: 0;
  font-size: 14px;
  color: var(--accent-color);
}

.product-actions {
  display: flex;
  gap: 5px;
  align-items: center;
  margin-left: auto;
}

button {
  margin: 0;
  padding: 5px 10px;
  font-size: 14px;
  border: none;
  color: white;
  border-radius: 5px;
  background-color: var(--accent-color);
  cursor: pointer;
}

.quantity {
  font-weight: bolder;
  min-width: 24px;
  text-align: center;
}

.total-price {
  font-weight: 700;
  min-width: 60px;
  font-size: 16px;
  text-align: right;
  padding-left: 10px;
}
</style>
