<template>
  <div class="user-row" :class="{inactive: !active}">
    <div class="select-box">
      <div class="select" v-show="active" @click="selectUser"> Select </div>
    </div>
    {{ displayName() }}
    <font-awesome-icon v-if="!user.ofAge" icon="fa-solid fa-baby"/>
  </div>
</template>

<script setup lang="ts">
import { GewisUserResponse, UserResponse } from "@sudosos/sudosos-client";
import { useCartStore } from "@/stores/cart.store";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

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
  if ("gewisId" in props.user && props.user.gewisId) {
    name += ` - M${props.user?.gewisId}`;
  } else {
    switch (props.user?.type) {
      case 'LOCAL_USER':
        name += ` - Local`;
        break;
    }
  }
  return name;
};

const canUse = props.user.acceptedToS !== "NOT_ACCEPTED";
const active = canUse;

</script>

<style scoped>
.user-row {
  font-size: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
  text-align: center;
  font-weight: bold;

  .select {
    background-color: var(--accent-color);
    color: white;
    padding: 5px;
    padding-left: 10px;
    padding-right: 10px;
    border-radius: 10px;
  }

  .select-box {
    min-width: 75px;
  }
}

.inactive {
  color: grey;
}
</style>
