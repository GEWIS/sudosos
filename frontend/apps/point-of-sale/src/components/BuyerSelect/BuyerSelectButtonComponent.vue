<template>
  <Button
    v-if="!isGhost && associate"
    class="text-lg px-4 py-4 select-user"
    :outlined="associate.type !== 'owner'"
    @click="select()"
  >
    <span>
      {{ associate.firstName }}
      <span v-if="associate.nickname" class="italic"> "{{ associate.nickname }}"</span>
      {{ associate.lastName }}
    </span>
  </Button>
  <div v-else class="text-lg px-4 py-4 select-user ghost-button" />
</template>

<script setup lang="ts">
import { withDefaults } from 'vue';
import Button from 'primevue/button';
import { useCartStore } from '@/stores/cart.store';
import { PointOfSaleAssociate } from '@/stores/pos.store';

const cartStore = useCartStore();

const props = withDefaults(
  defineProps<{
    associate: PointOfSaleAssociate | null;
    isGhost?: boolean;
  }>(),
  {
    associate: null,
    isGhost: false,
  },
);

const emit = defineEmits<{
  cancelSelectCreator: [];
}>();

const select = async () => {
  if (!props.associate) return;
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

.ghost-button {
  opacity: 0;
  pointer-events: none;
}
</style>
