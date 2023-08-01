<template>
  <div class="user-row flex-container font-size-lg fw-bold text-center gap-2"
       :class="{inactive: !active}" @click="selectUser">
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

<style scoped lang="scss">
.user-row {
  padding-left: 75px;
}

.inactive {
  color: grey;
}
</style>
