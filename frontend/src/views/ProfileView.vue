<template>
  <div class="page-container">

    <div class="page-title">{{ $t('profile.my profile')}}</div>

    <div class="container">
      <ChangePinComponent />

      <ChangeInfoComponent />

      <ChangePasswordComponent/>

      <ChangeApiKeyComponent />

    </div>



  </div>
</template>

<script setup lang="ts">
import ChangePasswordComponent from "@/components/ChangePasswordComponent.vue";
import ChangePinComponent from "@/components/ChangePinComponent.vue";
import ChangeApiKeyComponent from "@/components/ChangeApiKeyComponent.vue";
import CardComponent from "@/components/CardComponent.vue";
import ChangeInfoComponent from "@/components/ChangeInfoComponent.vue";


</script>

<style scoped>
@import "../styles/BasePage.css";

.warning {
  color: red;
  font-size: 75%;
}



.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 10px; /* Reduce the gap value to 10px */
  padding-bottom: 20px; /* Add bottom padding to prevent the last row from being cut off */
  padding-right: 50px;
}

</style>