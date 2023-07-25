<template>
  <div v-if="posNotLoaded" class="home-loader">
    <div>
      <ProgressSpinner aria-label="Loading" />
    </div>
  </div>
  <div v-else class="main-content">
    <div class="wrapper">
      <div class="pos-wrapper">
        <PointOfSaleDisplayComponent :point-of-sale="currentPos" />
        <ActivityComponent />
      </div>
      <div class="cart-wrapper">
        <CartComponent />
      </div>
    </div>
  </div>
  <SettingsIconComponent />
</template>
<script setup lang="ts">
import { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { onMounted, Ref, ref, watch } from 'vue';
import { usePointOfSaleStore } from '@/stores/pos.store';
import PointOfSaleDisplayComponent from '@/components/PointOfSaleDisplayComponent.vue';
import SettingsIconComponent from '@/components/SettingsIconComponent.vue';
import CartComponent from '@/components/Cart/CartComponent.vue';
import { useActivityStore } from '@/stores/activity.store';
import ActivityComponent from '@/components/ActivityComponent.vue';

const posNotLoaded = ref(true);
const currentPos: Ref<PointOfSaleWithContainersResponse | undefined> = ref(undefined);
const pointOfSaleStore = usePointOfSaleStore();
const activityStore = useActivityStore();

const fetchPointOfSale = async () => {
  await pointOfSaleStore.fetchPointOfSale(1);
  if (pointOfSaleStore.pointOfSale) {
    currentPos.value = pointOfSaleStore.pointOfSale;
  }
  posNotLoaded.value = false;
  activityStore.startTimer();
};

onMounted(fetchPointOfSale);

watch(
  () => pointOfSaleStore.pointOfSale,
  (newValue) => {
    if (newValue) currentPos.value = newValue;
  }
);
</script>
<style scoped>
.wrapper {
  display: flex;
  height: 100%;
  padding-top: 35px;
  padding-left: 60px;
  padding-right: 15px;
  padding-bottom: 25px;
}

.pos-wrapper {
  width: calc(100% - 350px);
}

.cart-wrapper {
  width: 350px;
}

/* Your existing styles */
.home-loader {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
