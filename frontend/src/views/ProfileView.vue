<template>
  <div class="page-container">
    <div class="page-title">{{ $t('profile.my profile')}}</div>
    <card-component :header="$t('profile.change pin code')" >

    </card-component>
  </div>
</template>

<script>
import CardComponent from "@/components/CardComponent.vue";

export default {
  name: "ProfileView",
  components: {CardComponent}
}
</script>

<style scoped>
@import "../styles/BasePage.css";

</style>