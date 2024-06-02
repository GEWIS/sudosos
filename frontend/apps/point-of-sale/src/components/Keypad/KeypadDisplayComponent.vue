<template>
  <div class="wrapper user accent-text" :class="{ inactive: !isActive }">
    <font-awesome-icon icon="fa-solid fa-user" class="fs-3 w-100" />
    <div class="display-value user-id">
      {{ external ? 'E' : '' }}
      <span v-for="char in userId" :key="char">
        {{ char }}
      </span>
    </div>
  </div>
  <div class="wrapper pincode accent-text" :class="{ inactive: isActive }">
    <font-awesome-icon icon="fa-solid fa-key" class="fs-3 w-100" />
    <div class="passcode-wrapper" :class="{ wrong: wrongPin }">
      <div class="fs-1" v-if="wrongPin">
        WRONG PIN
      </div>
      <div class="d-flex w-100 h-100 justify-content-between align-items-center" v-else>
        <span class="passcode-span" v-for="char in displayCode" :key="char">{{ char }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { computed } from "vue";

const props = defineProps({
  userId: {
    type: String,
    required: true
  },
  pinCode: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    required: true
  },
  wrongPin: {
    type: Boolean,
    required: true
  },
  external: {
    type: Boolean,
    required: true,
  }
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
  padding-left: 20px;
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
