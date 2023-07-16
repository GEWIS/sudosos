<template>
  <div className="wrapper">
    <div v-if="posNotLoaded" class="home-loader">
      <div>
        <ProgressSpinner aria-label="Loading" />
      </div>
    </div>
    <div v-else class="main-content">
      <PointOfSaleDisplayComponent :point-of-sale="currentPos"/>
      <CartComponent/>
    </div>
  </div>
  <SettingsIconComponent />
</template>
<script lang="ts">
// import Home from "@/components/Home.vue";
import {usePointOfSaleStore} from "@/stores/pos.store";
import {PointOfSaleWithContainersResponse} from "@sudosos/sudosos-client";
import PointOfSaleDisplayComponent from "@/components/PointOfSaleDisplayComponent.vue";
import SettingsIconComponent from "@/components/SettingsIconComponent.vue";
import CartComponent from "@/components/CartComponent.vue";

interface Data {
  posNotLoaded: boolean;
  currentPos: PointOfSaleWithContainersResponse | null;
}
export default {
  name: "CashierView",
  components: {
    CartComponent,
    SettingsIconComponent,
    PointOfSaleDisplayComponent,
    // Home,
  },
  data() {
    return {
      posNotLoaded: true,
      currentPos: null,
    };
  },
  async mounted() {
    const pointOfSaleStore = usePointOfSaleStore();

    await pointOfSaleStore.fetchPointOfSale(1).then(() => {
      this.currentPos = pointOfSaleStore.pointOfSale;
      this.posNotLoaded = false;
    });
  },
  watch: {
    '$store.pointOfSale.pointOfSale'(newValue) {
      this.currentPos = newValue;
    },
  },
};
</script>
<style scoped>
.home-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
