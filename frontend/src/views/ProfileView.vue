<template>
  <div class="page-container">
    <div class="page-title">{{ $t('profile.myProfile')}}</div>
    <div class="container">
      <div class ="row">
          <ChangePinComponent />
          <ChangePasswordComponent />
      </div>
      <div class="row">
          <ChangeApiKeyComponent />
          <ChangeInfoComponent />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChangePasswordComponent from "@/components/ChangePasswordComponent.vue";
import ChangePinComponent from "@/components/ChangePinComponent.vue";
import ChangeApiKeyComponent from "@/components/ChangeApiKeyComponent.vue";
import ChangeInfoComponent from "@/components/ChangeInfoComponent.vue";

</script>

<style scoped>
@import "../styles/BasePage.css";

.row {
  display: flex;
  flex-direction: row;
  width: 75%;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.container {
  display: flex;
  flex-direction: column;
}

</style>
