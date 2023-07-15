<template>
  <div class="settings-icon" @click="openSettings">
    <font-awesome-icon icon="fa-solid fa-cog" />
  </div>
</template>

<script>
export default {
  name: 'SettingsIcon',
  methods: {
    openSettings() {
      // Handle logic to open settings or emit an event
      // for the parent component to handle
    },
  },
};
</script>

<style scoped>
.settings-icon {
  height:100px;
  position: fixed;
  bottom: -10px;
  left: 60px;
  font-size: 100px;
  cursor: pointer;
}
</style>
