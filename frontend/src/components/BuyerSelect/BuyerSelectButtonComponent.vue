<template>
  <div class="select-user c-btn active square flex-grow-1 fs-6 py-4 px-4" @click="select()">
    {{member.firstName}} {{member.lastName}}
  </div>
</template>

<script setup lang="ts">
import { UserResponse } from "@sudosos/sudosos-client";
import { useCartStore } from "@/stores/cart.store";

const cartStore = useCartStore();

const props = defineProps({
  member: {
    type: Object as () => UserResponse,
    required: true,
  }
});

const emit = defineEmits(['cancelSelectCreator']);

const select = () => {
  cartStore.setCreatedBy(props.member);
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
