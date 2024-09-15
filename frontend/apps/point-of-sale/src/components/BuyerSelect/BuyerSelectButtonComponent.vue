<template>
  <div
    class="select-user active square flex-grow-1 fs-6 py-4 px-4"
    :class="{ 'c-btn': props.associate.type === 'owner', 'c-btn-outline': props.associate.type !== 'owner' }"
    @click="select()"
  >
    {{ displayName() }}
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from "@/stores/cart.store";
import { PointOfSaleAssociate } from "@/stores/pos.store";

const cartStore = useCartStore();

const props = defineProps({
  associate: {
    type: Object as () => PointOfSaleAssociate,
    required: true,
  }
});

const emit = defineEmits(['cancelSelectCreator']);

const displayName = () => {
  let name = props.associate.firstName;
  if (props.associate) {
    // @ts-ignore
    if (props.associate.nickname) name += ` "${props.associate.nickname}"`;
  }
  name += ' ' + props.associate.lastName;
  return name;
};

const select = () => {
  cartStore.setCreatedBy(props.associate);
  cartStore.checkout();
  emit('cancelSelectCreator');
};

</script>

<style scoped lang="scss">
.select-user {
  flex-basis: 30%;
  flex-shrink: 0;
  max-width: 33%;
}
</style>
