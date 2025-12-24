<template>
  <div class="mr-3 point-of-sale">
    <div class="header min-h-[4rem] flex items-center">
      <div class="flex flex-row gap-4 w-full items-center">
        <Button class="border-none" @click="cancelSelect()">
          <i class="pi pi-times" style="font-size: 2rem" />
        </Button>
        <div class="text-2xl font-semibold text-center flex-1">Select member of {{ organName }} to charge as:</div>
      </div>
    </div>
    <div class="buyer-grid mt-4">
      <BuyerSelectButtonComponent
        v-for="item in sortedAssociatesWithGaps"
        :key="item.key"
        :associate="item.associate"
        :is-ghost="item.isGhost"
        @cancel-select-creator="cancelSelect()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import Button from 'primevue/button';
import { PointOfSaleAssociate, usePointOfSaleStore } from '@/stores/pos.store';
import BuyerSelectButtonComponent from '@/components/BuyerSelect/BuyerSelectButtonComponent.vue';

const emit = defineEmits(['cancelSelectCreator']);

const posStore = usePointOfSaleStore();
const currentPos = posStore.getPos;
const posAssociates = computed<PointOfSaleAssociate[] | null>(() => posStore.getPointOfSaleAssociates);
const organName = computed(() => posStore.getPos?.owner?.firstName);

type AssociateWithIndex = PointOfSaleAssociate & { index: number };

interface AssociateItem {
  key: string;
  associate: PointOfSaleAssociate | null;
  isGhost: boolean;
}

const sortedAssociatesWithGaps = computed<AssociateItem[]>(() => {
  if (!posAssociates.value) return [];

  const withIndex: AssociateWithIndex[] = [];
  const withoutIndex: PointOfSaleAssociate[] = [];

  posAssociates.value.forEach((associate) => {
    const index = associate.index;
    if (typeof index === 'number') {
      withIndex.push(associate as AssociateWithIndex);
    } else {
      withoutIndex.push(associate);
    }
  });

  withIndex.sort((a, b) => a.index - b.index);

  const result: AssociateItem[] = [];
  const indexMap = new Map<number, AssociateWithIndex>();
  withIndex.forEach((associate) => {
    indexMap.set(associate.index, associate);
  });

  if (withIndex.length > 0) {
    const minIndex = withIndex[0]!.index;
    const maxIndex = withIndex[withIndex.length - 1]!.index;

    for (let i = minIndex; i <= maxIndex; i++) {
      const associate = indexMap.get(i);
      if (associate) {
        result.push({ key: `associate-${associate.id}`, associate, isGhost: false });
      } else {
        result.push({ key: `ghost-${i}`, associate: null, isGhost: true });
      }
    }
  }

  withoutIndex.forEach((associate) => {
    result.push({ key: `associate-${associate.id}`, associate, isGhost: false });
  });

  return result;
});

const fetchIfEmpty = () => {
  if (!currentPos || !currentPos.owner) return;
  if (!posAssociates.value) void posStore.fetchPointOfSaleAssociates(currentPos.id);
};

const cancelSelect = () => {
  emit('cancelSelectCreator');
};

onMounted(fetchIfEmpty);
</script>

<style scoped lang="scss">
.header > div {
  width: 100%;
}

.buyer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-auto-rows: 5rem;
  gap: 1rem;
  align-items: stretch;
  justify-items: stretch;
  width: 100%;
}
</style>
