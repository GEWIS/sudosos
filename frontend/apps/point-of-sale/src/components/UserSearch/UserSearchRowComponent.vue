<template>
  <div
    class="rounded-xl flex items-center font-semibold text-lg my-1 md:my-3 py-3 shadow-sm text-center pl-[75px] mr-[30px] text-white cursor-pointer user-row"
    :class="{ 'opacity-35 cursor-not-allowed': !active, 'not-of-age': shouldShowAge() }"
    @click="selectUser"
  >
    <i v-if="shouldShowAge()" class="pi pi-user-minus pr-2" />
    {{ displayName() }}
  </div>
</template>

<script setup lang="ts">
import { UserResponse } from '@sudosos/sudosos-client';
import { useCartStore } from '@/stores/cart.store';

const props = defineProps({
  user: {
    type: Object as () => UserResponse,
    required: true,
  },
});

const cartStore = useCartStore();
const selectUser = () => {
  void cartStore.setBuyer(props.user);
};

const aged = ['MEMBER', 'LOCAL_USER', 'LOCAL_ADMIN'];

const shouldShowAge = () => {
  return !props.user.ofAge && active && aged.includes(props.user.type);
};

const displayName = () => {
  let name = props.user.firstName;
  if (props.user) {
    if (props.user.nickname) name += ` "${props.user.nickname}"`;
  }
  name += ' ' + props.user.lastName;

  if (props.user.memberId) {
    name += ` - ${props.user?.memberId}`;
  } else {
    switch (props.user?.type) {
      case 'LOCAL_USER':
        name += ` - Local`;
        break;
    }
  }
  return name;
};

const canUse = props.user.acceptedToS !== 'NOT_ACCEPTED';
const active = canUse;
</script>

<style scoped lang="scss">
.user-row {
  background-color: color-mix(in srgb, var(--p-primary-color) 85%, gray);
}

.not-of-age {
  background-color: color-mix(in srgb, var(--p-primary-color) 50%, black);
}
</style>
