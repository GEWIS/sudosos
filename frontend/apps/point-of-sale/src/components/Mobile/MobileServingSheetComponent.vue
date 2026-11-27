<template>
  <MobileSheetComponent v-model:visible="visible" @show="fetchIfEmpty">
    <template #header>
      <h2 class="text-xl font-bold">Who is serving?</h2>
      <p class="text-sm opacity-70 mt-1">
        Sales are booked under this member of {{ posStore.getPos?.owner?.firstName }} until you switch.
      </p>
    </template>
    <div class="flex flex-col gap-2 pb-2">
      <button
        v-for="associate in associates"
        :key="associate.id"
        class="serving-row"
        :class="{ selected: associate.id === servingAs?.id }"
        type="button"
        @click="select(associate)"
      >
        <span class="avatar">{{ initials(associate) }}</span>
        <span class="flex-1 text-left font-semibold">{{ associate.firstName }} {{ associate.lastName }}</span>
        <i v-if="associate.id === servingAs?.id" class="pi pi-check-circle text-xl" />
      </button>
      <ProgressSpinner v-if="associates === null" class="w-10 h-10" />
    </div>
  </MobileSheetComponent>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import MobileSheetComponent from '@/components/Mobile/MobileSheetComponent.vue';
import { PointOfSaleAssociate, usePointOfSaleStore } from '@/stores/pos.store';

const visible = defineModel<boolean>('visible', { required: true });
const servingAs = defineModel<PointOfSaleAssociate | null>('servingAs', { required: true });
const emit = defineEmits<{ selected: [] }>();

const posStore = usePointOfSaleStore();
const associates = computed(() => posStore.getPointOfSaleAssociates);

const fetchIfEmpty = () => {
  const pos = posStore.getPos;
  if (pos && associates.value === null) void posStore.fetchPointOfSaleAssociates(pos.id);
};

const initials = (user: PointOfSaleAssociate) => `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase();

const select = (associate: PointOfSaleAssociate) => {
  servingAs.value = associate;
  visible.value = false;
  emit('selected');
};
</script>

<style scoped lang="scss">
.serving-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--p-surface-300);
  border-radius: var(--p-button-border-radius);

  &.selected {
    border: 2px solid var(--p-primary-color);
    background: color-mix(in srgb, var(--p-primary-color) 8%, white);
    color: var(--p-primary-color);
  }
}

.avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: var(--p-button-border-radius);
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-weight: 700;
}
</style>
