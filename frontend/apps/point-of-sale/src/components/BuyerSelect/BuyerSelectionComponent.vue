<template>
  <div class="mr-3 point-of-sale">
    <div class="header">
      <div class="header-row">
        <div class="active c-btn icon-large search-close square" @click="cancelSelect()">
          <i class="pi pi-times text-4xl" />
        </div>
        <div class="text-2xl text-center w-full">Select member of {{ organName }} to charge as:</div>
      </div>
    </div>
    <div class="align-content-center flex-container flex-wrap gap-3 h-full justify-content-center w-full">
      <BuyerSelectButtonComponent
        v-for="associate in posAssociates"
        :key="associate.id"
        :associate="associate"
        @cancel-select-creator="cancelSelect()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { PointOfSaleAssociate, usePointOfSaleStore } from '@/stores/pos.store';
import BuyerSelectButtonComponent from '@/components/BuyerSelect/BuyerSelectButtonComponent.vue';

const emit = defineEmits(['cancelSelectCreator']);

const posStore = usePointOfSaleStore();
const currentPos = posStore.getPos;
const posAssociates = computed<PointOfSaleAssociate[] | null>(() => posStore.getPointOfSaleAssociates);
const organName = computed(() => posStore.getPos?.owner?.firstName);

const fetchIfEmpty = () => {
  if (!currentPos || !currentPos.owner) return;
  if (!posAssociates.value) void posStore.fetchPointOfSaleAssociates(currentPos.id);
};

const cancelSelect = () => {
  emit('cancelSelectCreator');
};

onMounted(fetchIfEmpty);
</script>

<style scoped lang="scss"></style>
