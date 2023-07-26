<template>
  <div class="user-row" :class="{inactive: !active}">
    <div class="select" @click="selectUser"> Select </div>
    {{ displayName() }}
  </div>
</template>

<script setup lang="ts">
import { GewisUserResponse, UserResponse } from "@sudosos/sudosos-client";
import { useCartStore } from "@/stores/cart.store";

const props = defineProps({
  user: {
    type: Object as () => UserResponse | GewisUserResponse,
    required: true,
  }
});

const cartStore = useCartStore();
const selectUser = () => {
  cartStore.setBuyer(props.user);
};

const displayName = () => {
  let name = `${props.user.firstName} ${props.user.lastName}`;
  if ("gewisId" in props.user) {
    name += ` - ${props.user?.gewisId}`;
  } else {
    switch (props.user?.type) {
      case 'LOCAL_USER':
        name += ` - Local`;
        break;
    }
  }
  return name;
};
console.error(props.user.active && props.user.acceptedToS !== "NOT_ACCEPTED");
const active = props.user.active && props.user.acceptedToS !== "NOT_ACCEPTED";
</script>

<style scoped>
.user-row {
  font-size: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  text-align: center;

  > .select {
    background-color: var(--accent-color);
    color: white;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 10px;
  }

}

.inactive {
  color: grey;
}
</style>
