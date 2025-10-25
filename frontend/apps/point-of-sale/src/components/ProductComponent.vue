<template>
  <div class="relative text-center w-[145px] h-[200px] shadow-lg bg-white p-2 mx-2 my-1 flex flex-col rounded-lg">
    <div class="flex-1 min-h-0 flex items-center justify-center">
      <img
        ref="productImage"
        :alt="product.name"
        class="h-full w-auto max-w-full object-contain"
        :class="{ pulsing, featured: product.featured }"
        :src="image"
        @click="addToCart"
      />
      <div v-if="product.featured" class="promo-tag absolute top-2 left-2 opacity-70">PROMO</div>
    </div>

    <!-- TEXT AREA: fixed height including both name + price -->
    <div class="h-14 flex flex-col justify-center px-2">
      <p class="text-base font-bold leading-tight truncate m-0">{{ product.name }}</p>
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
  flyElement.classList.remove('pulsing');
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
  flyElement.style.zIndex = '9999';

  const destinationRect = destinationElement.getBoundingClientRect();
  // Fine-tune the destination position to account for cart item styling
  const deltaX = destinationRect.left - rect.left - 40; // Small horizontal adjustment
  const deltaY = destinationRect.top - rect.top - 40; // Small vertical adjustment

  // Calculate scale factor to shrink to 3rem
  const targetSize = 48; // 3rem = 48px
  const scaleX = targetSize / rect.width;
  const scaleY = targetSize / rect.height;

  // Move the flying element to the destination element's position using the delta values
  flyElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
  flyElement.style.opacity = '0.5';

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
.pulsing {
  animation: pulse 0.5s;
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

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    opacity: 1;
  }
}
</style>
