<template>
  <div class="user-row flex-container font-size-lg fw-bold text-center my-1 py-3"
       :class="{inactive: !active}" @click="selectUser">
    {{ displayName() }}
    <font-awesome-icon v-if="shouldShowAge()" icon="fa-solid fa-baby"/>
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

const aged = ["MEMBER", "LOCAL_USER", "LOCAL_ADMIN"];

const shouldShowAge = () => {
  return !props.user.ofAge && active && aged.includes(props.user.type);
};

const displayName = () => {
  let name = props.user.firstName;
  if (props.user) {
    // @ts-ignore
    if (props.user.nickname) name += ` "${props.user.nickname}"`;
  }
  name += ' ' + props.user.lastName;

  if ("gewisId" in props.user && props.user.gewisId) {
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
