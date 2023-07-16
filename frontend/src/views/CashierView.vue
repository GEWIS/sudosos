<template>
  <div className="wrapper">
    <div v-if="posNotLoaded" class="home-loader">
      <div>
        <ProgressSpinner aria-label="Loading" />
      </div>
    </div>
    <div v-else class="main-content">
      <PointOfSaleDisplay :point-of-sale="currentPos"/>
    </div>
  </div>
  <SettingsIcon />
</template>
<script lang="ts">
// import Home from "@/components/Home.vue";
import {usePointOfSaleStore} from "@/stores/pos.store";
import {PointOfSaleWithContainersResponse} from "sudosos-client";
import PointOfSaleDisplay from "@/components/PointOfSaleDisplay.vue";
import SettingsIcon from "@/components/SettingsIcon.vue";

interface Data {
  posNotLoaded: boolean;
  currentPos: PointOfSaleWithContainersResponse | null;
}
export default {
  name: "CashierView",
  components: {
    SettingsIcon,
    PointOfSaleDisplay
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
