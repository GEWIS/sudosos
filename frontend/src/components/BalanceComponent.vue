<template>
  <CardComponent header="balance" action="Increase Online">
      <div class="body">
        <h1>€420.69</h1>
      </div>
  </CardComponent>
</template>

<script>
import {defineComponent} from "vue";
import CardComponent from "@/components/CardComponent.vue";

export default defineComponent({
  components: {CardComponent}
})
</script>

<style scoped lang="scss">
h1 {
  font-size: 50px;
  text-align: center;
  font-family: Raleway, sans-serif!important;
  font-weight: 500;
}
</style>
