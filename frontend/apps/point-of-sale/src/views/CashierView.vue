<template>
  <div v-if="posNotLoaded" class="home-loader">
    <div>
      <ProgressSpinner aria-label="Loading" />
    </div>
  </div>
  <div v-else class="main-content">
    <div class="wrapper">
      <div class="pos-wrapper">
        <UserSearchComponent v-if="currentState === PointOfSaleState.SEARCH_USER" @cancel-search="cancelSearch()"/>
        <PointOfSaleDisplayComponent :point-of-sale="currentPos" v-if="currentState === PointOfSaleState.DISPLAY_POS"/>
        <BuyerSelectionComponent v-if="currentState === PointOfSaleState.SELECT_CREATOR"
                                 @cancel-select-creator="cancelSelectCreator()"/>
        <ActivityComponent />
      </div>
      <div class="cart-wrapper">
        <CartComponent @select-user="selectUser()" @select-creator="selectCreator()"/>
      </div>
    </div>
  </div>
  <SettingsIconComponent />
</template>
<script setup lang="ts">
import { PointOfSaleWithContainersResponse } from '@sudosos/sudosos-client';
import { onMounted, Ref, ref, watch } from 'vue';
import { usePointOfSaleStore } from '@/stores/pos.store';
import PointOfSaleDisplayComponent from '@/components/PointOfSaleDisplay/PointOfSaleDisplayComponent.vue';
import SettingsIconComponent from '@/components/SettingsIconComponent.vue';
import CartComponent from '@/components/Cart/CartComponent.vue';
import { useActivityStore } from '@/stores/activity.store';
import ActivityComponent from '@/components/ActivityComponent.vue';
import UserSearchComponent from "@/components/UserSearch/UserSearchComponent.vue";
import BuyerSelectionComponent from "@/components/BuyerSelect/BuyerSelectionComponent.vue";

const posNotLoaded = ref(true);
const currentPos: Ref<PointOfSaleWithContainersResponse | undefined> = ref(undefined);
const pointOfSaleStore = usePointOfSaleStore();
const activityStore = useActivityStore();

enum PointOfSaleState {
  SEARCH_USER,
  DISPLAY_POS,
  SELECT_CREATOR,
}

const currentState = ref(PointOfSaleState.DISPLAY_POS);

const fetchPointOfSale = async () => {
  const storedPos = pointOfSaleStore.getPos;
  const target = storedPos ? storedPos.id : 1;

  await pointOfSaleStore.fetchPointOfSale(target).catch(async () => {
    await pointOfSaleStore.fetchPointOfSale(1);
  }).finally(() => {
    if (pointOfSaleStore.pointOfSale) {
      currentPos.value = pointOfSaleStore.pointOfSale;
    }
    posNotLoaded.value = false;
    activityStore.restartTimer();
  });
};

onMounted(fetchPointOfSale);

const selectUser = () => {
  currentState.value = PointOfSaleState.SEARCH_USER;
};

const cancelSearch = () => {
  currentState.value = PointOfSaleState.DISPLAY_POS;
};

const selectCreator = () => {
  currentState.value = PointOfSaleState.SELECT_CREATOR;
};

const cancelSelectCreator = () => {
  currentState.value = PointOfSaleState.DISPLAY_POS;
};

watch(
  () => pointOfSaleStore.pointOfSale,
  (newPos) => {
    if (newPos) currentPos.value = newPos;
  }
);
</script>
<style scoped lang="scss">
.wrapper {
  display: flex;
  height: 100%;
  padding: 35px 15px 25px 35px;
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
