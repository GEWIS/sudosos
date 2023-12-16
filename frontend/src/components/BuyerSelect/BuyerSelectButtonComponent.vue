<template>
  <div class="select-user c-btn active square flex-grow-1 fs-6 py-4 px-4" @click="select()">
    {{ displayName() }}
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

const displayName = () => {
  let name = props.member.firstName;
  if (props.member) {
    // @ts-ignore
    if (props.member.nickname) name += ` "${props.member.nickname}"`;
  }
  name += ' ' + props.member.lastName;
  return name;
};

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
