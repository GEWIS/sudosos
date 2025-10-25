<template>
  <Button class="text-lg px-4 py-4 select-user" :outlined="props.associate.type !== 'owner'" @click="select()">
    <span>
      {{ props.associate.firstName }}
      <span v-if="props.associate.nickname" class="italic"> "{{ props.associate.nickname }}"</span>
      {{ props.associate.lastName }}
    </span>
  </Button>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { useCartStore } from '@/stores/cart.store';
import { PointOfSaleAssociate } from '@/stores/pos.store';

const cartStore = useCartStore();

const props = defineProps({
  associate: {
    type: Object as () => PointOfSaleAssociate,
    required: true,
  },
});

const emit = defineEmits(['cancelSelectCreator']);

const select = async () => {
  cartStore.setCreatedBy(props.associate);
  await cartStore.checkout();
  emit('cancelSelectCreator');
};
</script>

<style scoped lang="scss">
.select-user {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
