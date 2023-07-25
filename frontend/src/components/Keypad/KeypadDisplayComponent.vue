<template>
  <div class="wrapper user" :class="{ inactive: !isActive }">
    <font-awesome-icon icon="fa-solid fa-user" class="icon" />
    <div class="display-value">
      <span v-for="char in userId" :key="char">{{ char }}</span>
    </div>
  </div>
  <div class="wrapper pincode" :class="{ inactive: isActive }">
    <font-awesome-icon icon="fa-solid fa-key" class="icon" />
    <div class="display-value" :class="{ wrong: wrongPin }">
      <span v-for="char in pinCode" :key="char">•</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
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
  }
});
</script>

<style scoped>
.display-value {
  display: flex;
  background: white;
  padding-left: 20px;
  width: calc(3 * var(--key-size) + 2 * var(--key-gap-size));

  border-radius: 15px;
  font-size: 45px;
  text-align: left;
  min-height: 95px;
  align-items: center;
  margin-top: 10px;
}

.display-value span {
  padding: 0 10px;
  background-color: white;
  font-weight: bold;
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
  border: 2px solid red;
}

.wrapper.inactive {
  opacity: 0.7; /* Set opacity for the inactive wrapper */
}

.icon {
  font-size: 26px;
  width: 100%;
  margin: auto;
}
</style>
