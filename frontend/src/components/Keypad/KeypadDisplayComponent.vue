<template>
  <div class="wrapper user" :class="{ inactive: !isActive }">
    <font-awesome-icon icon="fa-solid fa-user" class="fs-3 w-100" />
    <div class="display-value">
      {{ external ? 'E' : '' }}
      <span v-for="char in userId" :key="char">
        {{ char }}
      </span>
    </div>
  </div>
  <div class="wrapper pincode" :class="{ inactive: isActive }">
    <font-awesome-icon icon="fa-solid fa-key" class="fs-3 w-100" />
    <div class="display-value" :class="{ wrong: wrongPin }">
      <div v-if="wrongPin">
        WRONG PIN
      </div>
      <span v-else v-for="char in pinCode" :key="char">•</span>
    </div>
  </div>
</template>

<script setup lang="ts">

defineProps({
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
</script>

<style scoped lang="scss">
.display-value {
  display: flex;
  background: $body-overlay-color;
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

.display-value.wrong {
  background-color: #ff6e99;
  color: $body-overlay-color;
  text-align: center;
}

.wrapper.inactive {
  opacity: 0.7;
}
</style>
