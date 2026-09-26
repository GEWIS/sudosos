<template>
  <div
    class="flex items-center gap-3 min-h-[3.75rem] px-4 py-2 border-b border-gray-100 cursor-pointer select-none active:bg-gray-100"
    :class="count > 0 ? 'bg-primary-50' : 'bg-white'"
    @click="increase"
  >
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <i v-if="product.preferred" aria-label="Preferred" class="pi pi-star-fill text-primary text-xs" />
        <span class="font-bold leading-tight break-words">{{ product.name }}</span>
      </div>
      <div class="flex items-center gap-2 mt-0.5">
        <span class="text-sm text-gray-600">€{{ productPrice }}</span>
        <span v-if="product.featured" class="promo-tag text-[0.65rem] font-bold px-1.5 rounded">PROMO</span>
      </div>
    </div>

    <div class="flex items-center gap-1 shrink-0" @click.stop>
      <template v-if="count > 0">
        <Button aria-label="Remove one" class="stepper-button" icon="pi pi-minus" outlined rounded @click="decrease" />
        <span class="w-7 text-center font-bold tabular-nums">{{ count }}</span>
      </template>
      <Button aria-label="Add one" class="stepper-button" icon="pi pi-plus" rounded @click="increase" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContainerWithProductsResponse, ProductResponse } from '@gewis/sudosos-client';
import { useCartStore } from '@/stores/cart.store';
import { formatPrice } from '@/utils/FormatUtils';

const props = defineProps<{
  product: ProductResponse;
  container: ContainerWithProductsResponse;
}>();

const cartStore = useCartStore();

const productPrice = computed(() => formatPrice(props.product.priceInclVat.amount));

const cartProduct = computed(() =>
  cartStore.getProducts.find(
    (p) =>
      p.container.id === props.container.id &&
      p.product.id === props.product.id &&
      p.product.revision === props.product.revision,
  ),
);

const count = computed(() => cartProduct.value?.count ?? 0);

const increase = () => {
  cartStore.addToCart({ product: props.product, container: props.container, count: 1 });
};

const decrease = () => {
  if (cartProduct.value) cartStore.removeFromCart(cartProduct.value);
};
</script>

<style scoped lang="scss">
.promo-tag {
  color: #fff;
  background-color: var(--p-primary-color);
}

.stepper-button {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
