<template>
  <div class="cart-item">
    <div class="product">
      <img :src="getImageSrc(product)" :alt="product.name" class="product-image" />
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
import {defineProps, computed, ref} from 'vue';
import { CartProduct } from "@/types/CartProduct";
import { useCartStore } from "@/stores/cart.store";
import { usePointOfSaleStore } from "@/stores/pos.store";
import { Product } from "@sudosos/sudosos-client";

const cartStore = useCartStore();
const posStore = usePointOfSaleStore();

const props = defineProps({
  cartProduct: {
    type: Object as () => CartProduct,
    required: true,
  },
});

const product = ref(props.cartProduct.product);

const getImageSrc = (product: Product) => {
  if (!product.image) {
    return 'https://imgur.com/CS0aauU.png';
  } else {
    return `${import.meta.env.VITE_APP_IMAGE_BASE}products/${product.image}`;
  }
};

const decreaseQuantity = () => {
  cartStore.removeFromCart(props.cartProduct);
};

const increaseQuantity = () => {
  cartStore.addToCart({ ...props.cartProduct, count: 1 });
};

const getProductPrice = () => {
  return (product.value.priceInclVat.amount / 100).toFixed(2);
};

const totalPrice = computed(() => {
  const price = parseFloat(getProductPrice());
  return (price * props.cartProduct.count).toFixed(2);
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
}

.product-name {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.product-category {
  margin: 0;
  font-weight: bold;
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
