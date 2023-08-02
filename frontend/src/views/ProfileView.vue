<template>
  <div class="page-container">

    <div class="page-title">{{ $t('profile.my profile')}}</div>

    <ChangePinComponent />

    <ChangePasswordComponent/>

    <ChangeApiKeyComponent />




  </div>
</template>

<script setup lang="ts">
import ChangePasswordComponent from "@/components/ChangePasswordComponent.vue";
import ChangePinComponent from "@/components/ChangePinComponent.vue";
import ChangeApiKeyComponent from "@/components/ChangeApiKeyComponent.vue";


</script>

<style scoped>
@import "../styles/BasePage.css";

.warning {
  color: red;
  font-size: 75%;
}

</style>