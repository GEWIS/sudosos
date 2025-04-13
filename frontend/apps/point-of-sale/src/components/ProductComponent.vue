<template>
  <div class="text-center product-card shadow-2 mb-2">
    <div class="image-container">
      <img ref="productImage" :class="{ pulsing, featured: product.featured }"
           class="product-card-image" :src="image" :alt="product.name" @click="addToCart"/>
      <div v-if="product.featured" class="promo-tag">PROMO</div>
    </div>
    <div class="product-name-wrapper">
      <p class="product-name font-size-md font-semibold m-0 px-2" >{{ product.name }}</p>
    </div>
    <p class="product-price font-size-sm m-0">€{{ productPrice }}</p>
  </div>
</template>

<script setup lang="ts">
import { ContainerWithProductsResponse, ProductResponse } from '@sudosos/sudosos-client';
import { useCartStore } from '@/stores/cart.store';
import { getProductImageSrc } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/FormatUtils';
import { nextTick, ref } from "vue";
import { useSettingStore } from "@/stores/settings.store";

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
const productImage = ref<HTMLElement | null>(null);


const settings = useSettingStore();
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

  // Start the flying animation
  if (settings.showAddToCartAnimation) startFlyingAnimation();
};


const startFlyingAnimation = async () => {
  await nextTick();
  const destinationElement = document.getElementById(`${props.product.name}`);
  if (!destinationElement || !productImage.value) {
    return;
  }

  const flyElement = productImage.value.cloneNode() as HTMLElement;
  document.body.appendChild(flyElement);

  const rect = productImage.value.getBoundingClientRect();
  flyElement.classList.add('product-image');

  // $product-column-width - $product-card-size
  const offset = 36;

  flyElement.style.position = 'fixed';
  flyElement.style.top = `${rect.top}px`;
  flyElement.style.left = `${rect.left + offset}px`;
  flyElement.style.width = `${rect.width}px`;
  flyElement.style.height = `${rect.height}px`;
  flyElement.style.pointerEvents = 'none';
  flyElement.style.transition = 'all 0.5s ease-in-out';

  const destinationRect = destinationElement.getBoundingClientRect();
  const deltaX = destinationRect.left - (rect.left + offset);
  const deltaY = destinationRect.top - rect.top;

  // Move the flying element to the destination element's position using the delta values
  flyElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
  flyElement.style.width = '52px';
  flyElement.style.height = '52px';

  // Cleanup the temporary element after the animation is complete
  const removeFlyElement = () => {
    if (flyElement.parentNode) {
      flyElement.parentNode.removeChild(flyElement);
    }
    flyElement.removeEventListener('transitionend', removeFlyElement);
  };

  flyElement.addEventListener('transitionend', removeFlyElement);
};

</script>

<style scoped lang="scss">
.product-card-image {
  width: $product-card-size;
  height: $product-card-size;
  background-color: $gewis-grey-light;
  border-top-left-radius: $border-radius;
  border-top-right-radius: $border-radius;
  object-fit: contain;
  box-sizing: border-box;
}

.image-container {
  position: relative; /* Establish this div as the positioning context for absolute elements within */
  width: $product-card-size; /* Adjust to match the image size */
  height: $product-card-size; /* Adjust to match the image size */
  margin: auto; /* Center the container */
}

.product-card {
  padding: 0 0 8px 0;
  border-radius: $border-radius;
  width: var(--product-card-width);

  &.pulsing {
    animation: pulse 0.5s infinite;
  }
}

.product-name, .product-price {
  position: relative; /* Ensure text is positioned relative to its container for proper layering */
  z-index: 2; /* Higher z-index ensures it's on top if needed */
}

.promo-tag {
  position: absolute;
  top: 15px;
  left: 0;
  right: 0;
  color: #fff;
  font-weight: bolder;
  background-color: $gewis-red-shadow;
  text-align: center;
  font-size: 1.2em;
  padding: 5px 0;
}

.product-name-wrapper {
  height: calc(1.2em * 2.3);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.product-name {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1;
  padding-bottom: 0.1em;
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
