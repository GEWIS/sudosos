<template>
  <div class="wrapper user" :class="{inactive: !isActive}">
    <font-awesome-icon icon="fa-solid fa-user" class="icon" />
    <div class="display-value">
      <span v-for="char in userId" :key="char">{{ char }}</span>
    </div>
  </div>
  <div class="wrapper pincode" :class="{inactive: isActive}">
    <font-awesome-icon icon="fa-solid fa-key" class="icon" />
    <div class="display-value">
      <span v-for="char in pinCode" :key="char">{{ char }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KeypadDisplay',
  props: {
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
  },
};
</script>

<style scoped>
.display-value {
  display: flex;
  background: white;
  padding-left: 20px;
  width: 290px;
  border-radius: 15px;
  font-size: 52px;
  text-align: left;
  min-height: 105px;
  align-items: center;
  margin-top: 10px;
}

.display-value span {
  padding: 0 10px;
  font-weight: bold;
}

.wrapper.user {
  width: 290px;
  margin: auto 80px 30px auto;
}

.wrapper {
  width: 290px;
}

.wrapper.inactive {
  opacity: 0.7; /* Set opacity for the inactive wrapper */
}

.icon {
  font-size: 30px;
  width: 100%;
  margin: auto;
}
</style>
