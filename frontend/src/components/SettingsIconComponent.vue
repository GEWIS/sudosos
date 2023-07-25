<template>
  <div class="settings-icon" @click="openSettings">
    <font-awesome-icon icon="fa-solid fa-cog" />
  </div>
</template>

<script setup lang="ts">
const openSettings = () => {
  // open settings modal
};
</script>

<style scoped>
.settings-icon {
  height: 100px;
  position: fixed;
  bottom: -35px;
  left: 60px;
  font-size: 70px;
  cursor: pointer;
}
</style>
