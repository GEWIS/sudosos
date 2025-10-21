<template>
  <div class="relative text-center h-40 shadow-lg bg-white p-2 m-2 flex flex-col rounded-lg">
    <div class="flex-1 min-h-0 flex items-center justify-center">
      <img
        ref="productImage"
        :alt="product.name"
        class="h-full w-auto max-w-full object-contain"
        :class="{ pulsing, featured: product.featured }"
        :src="image"
        @click="addToCart"
      />
      <div v-if="product.featured" class="promo-tag absolute top-2 left-2">PROMO</div>
    </div>

    <!-- TEXT AREA: fixed height including both name + price -->
    <div class="h-14 flex flex-col justify-center px-2">
      <p class="text-sm font-bold leading-tight truncate m-0">{{ product.name }}</p>
      <p class="text-xs m-0">€{{ productPrice }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ContainerWithProductsResponse, ProductResponse } from '@sudosos/sudosos-client';
import { nextTick, ref } from 'vue';
import { useCartStore } from '@/stores/cart.store';
import { getProductImageSrc } from '@/utils/imageUtils';
import { formatPrice } from '@/utils/FormatUtils';
import { useSettingStore } from '@/stores/settings.store';

const pulsing = ref(false);

const props = defineProps({
  product: {
    type: Object as () => ProductResponse,
    required: true,
  },
  container: {
    type: Object as () => ContainerWithProductsResponse,
    required: true,
  },
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
    count: 1,
  });

  // Start the flying animation
  if (settings.showAddToCartAnimation) void startFlyingAnimation();
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

  flyElement.style.position = 'fixed';
  flyElement.style.top = `${rect.top}px`;
  flyElement.style.left = `${rect.left}px`;
  flyElement.style.width = `${rect.width}px`;
  flyElement.style.height = `${rect.height}px`;
  flyElement.style.pointerEvents = 'none';
  flyElement.style.transition = 'transform 0.5s ease-in-out, opacity 0.5s ease-in-out';
  flyElement.style.transformOrigin = 'center center';
  flyElement.style.opacity = '1';

  const destinationRect = destinationElement.getBoundingClientRect();
  // Fine-tune the destination position to account for cart item styling
  const deltaX = destinationRect.left - rect.left - 20; // Small horizontal adjustment
  const deltaY = destinationRect.top - rect.top - 20; // Small vertical adjustment

  // Calculate scale factor to shrink to 3rem
  const targetSize = 48; // 3rem = 48px
  const scaleX = targetSize / rect.width;
  const scaleY = targetSize / rect.height;

  // Move the flying element to the destination element's position using the delta values
  flyElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
  flyElement.style.opacity = '0.3';

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
  //width: $product-card-size;
  //height: $product-card-size;
  //background-color: $gewis-grey-light;
  //border-top-left-radius: $border-radius;
  //border-top-right-radius: $border-radius;
  object-fit: contain;
  box-sizing: border-box;
}

.image-container {
  position: relative; /* Establish this div as the positioning context for absolute elements within */
  //width: $product-card-size; /* Adjust to match the image size */
  //height: $product-card-size; /* Adjust to match the image size */
  margin: auto; /* Center the container */
}

.product-card {
  padding: 0 0 8px 0;
  //border-radius: $border-radius;
  width: var(--product-card-width);

  &.pulsing {
    animation: pulse 0.5s infinite;
  }
}

.product-name,
.product-price {
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
  background-color: var(--p-primary-color);
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
  //height: $product-price-height;
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
