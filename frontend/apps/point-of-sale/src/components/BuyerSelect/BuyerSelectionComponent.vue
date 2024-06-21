<template>
  <div class="point-of-sale mr-3">
    <div class="header">
      <div class="header-row">
        <div class="c-btn active square search-close icon-large" @click="cancelSelect()">
          <i class="pi pi-times text-4xl"/>
        </div>
        <div class="w-full text-center text-2xl">
          Select member of {{ organName }} to charge as:
        </div>
      </div>
    </div>
    <div class="flex-container align-content-center justify-content-center flex-wrap w-full h-full gap-3">
      <BuyerSelectButtonComponent v-for="member in organMembers"  :key="member.id" :member="member"
                                  @cancel-select-creator="cancelSelect()"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { usePointOfSaleStore } from "@/stores/pos.store";
import BuyerSelectButtonComponent from "@/components/BuyerSelect/BuyerSelectButtonComponent.vue";
import { UserResponse } from "@sudosos/sudosos-client";

const emit = defineEmits(['cancelSelectCreator']);

const posStore = usePointOfSaleStore();
const currentPos = posStore.getPos;
const organMembers = computed<UserResponse[] | null>(() => posStore.getPointOfSaleMembers);
const organName = computed(() => posStore.getPos?.owner?.firstName);

const fetchIfEmpty = () => {
  if (!currentPos || !currentPos.owner) return;
  if (!organMembers.value) posStore.fetchPointOfSaleMembers(currentPos.owner.id);
};

const cancelSelect = () => {
  emit('cancelSelectCreator');
};

onMounted(fetchIfEmpty);
</script>

<style scoped lang="scss">
</style>
