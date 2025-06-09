<template>
  <LoginInfoComponent />
  <div class="accent-text user wrapper" :class="{ inactive: !isActive }">
    <i class="pi pi-user text-center w-full" style="font-size: 3rem" />
    <div
      class="display-value pl-3 shadow-sm"
      @click="
        () => {
          emits('focus:userid');
        }
      "
    >
      {{ external ? 'E' : '' }}
      <span v-for="char in userId" :key="char">
        {{ char }}
      </span>
    </div>
  </div>
  <div class="accent-text pincode wrapper" :class="{ inactive: isActive }">
    <i class="pi pi-key text-center w-full" style="font-size: 3rem" />
    <div class="passcode-wrapper" :class="{ wrong: wrongPin }">
      <div v-if="wrongPin" class="text-5xl">WRONG PIN</div>
      <div
        v-else
        class="items-center flex h-full justify-between w-full"
        @click="
          () => {
            emits('focus:passcode');
          }
        "
      >
        <span v-for="char in displayCode" :key="char" class="passcode-span shadow-sm">{{ char }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LoginInfoComponent from '@/components/LoginInfoComponent.vue';

const emits = defineEmits(['focus:passcode', 'focus:userid']);

const props = defineProps({
  userId: {
    type: String,
    required: true,
  },
  pinCode: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
  wrongPin: {
    type: Boolean,
    required: true,
  },
  external: {
    type: Boolean,
    required: true,
  },
});

const displayCode = computed<string[]>(() => {
  const array = [...props.pinCode.split('')].fill('•');
  const fillerArray = new Array(4 - array.length).fill(' ');
  return array.concat(fillerArray);
});
</script>

<style scoped lang="scss">
.display-value {
  display: flex;
  background-color: $body-overlay-color;
  width: calc(3 * var(--key-size) + 2 * var(--key-gap-size));

  border-radius: $border-radius;
  font-size: $font-size-larger;
  text-align: left;
  min-height: $keypad-display-height;
  align-items: center;
  margin-top: 10px;
  font-weight: bold;

  > span {
    padding: 0 10px;
    font-weight: bold;
    background-color: $body-overlay-color;
  }
}

.passcode-wrapper {
  display: flex;
  width: calc(3 * var(--key-size) + 2 * var(--key-gap-size));
  margin-top: 10px;
  font-weight: bold;
  min-height: $keypad-display-height;

  .passcode-span {
    font-size: $font-size-larger;
    font-weight: bold;
    text-align: center;
    min-height: $keypad-display-height;
    background-color: $body-overlay-color;
    min-width: 65px;

    border-radius: $border-radius;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.wrapper.user {
  width: calc(3 * var(--key-size) + 2 * var(--key-gap-size));
  margin: auto 80px 0 auto;
}

.wrapper {
  width: calc(3 * var(--key-size) + 2 * var(--key-gap-size));
}

.wrapper.pincode {
  background-color: transparent;
}

.wrong {
  background-color: #ff6e99;
  color: $body-overlay-color;
  text-align: center;
  border-radius: $border-radius;

  > div {
    width: 100%;
    margin: auto;
  }
}

.wrapper.inactive {
  opacity: 0.7;
}
</style>
