<template>
  <Button
    v-if="!isGhost && associate"
    class="text-lg px-4 py-4 select-user"
    :disabled="props.isDisabled"
    :outlined="associate.type !== 'owner'"
    @click="select()"
  >
    <ProgressSpinner v-if="props.isLoading" stroke-width="4" style="width: 30px; height: 30px" />
    <span v-else>
      {{ associate.firstName }}
      <span v-if="associate.nickname" class="italic"> "{{ associate.nickname }}"</span>
      {{ associate.lastName }}
    </span>
  </Button>
  <div v-else class="text-lg px-4 py-4 select-user ghost-button" />
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { useCartStore } from '@/stores/cart.store';
import { PointOfSaleAssociate } from '@/stores/pos.store';

const cartStore = useCartStore();

const props = withDefaults(
  defineProps<{
    associate: PointOfSaleAssociate | null;
    isGhost?: boolean;
    isDisabled?: boolean;
    isLoading?: boolean;
  }>(),
  {
    associate: null,
    isGhost: false,
    isDisabled: false,
    isLoading: false,
  },
);

const emit = defineEmits<{
  cancelSelectCreator: [];
  buttonClicked: [number];
}>();

const select = async () => {
  if (!props.associate) return;
  emit('buttonClicked', props.associate.id);
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
