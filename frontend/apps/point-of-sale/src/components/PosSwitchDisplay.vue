<template>
  <div>
    <div v-if="loading" class="flex justify-center py-8">
      <ProgressSpinner style="width: 50px; height: 50px" />
    </div>
    <div v-else-if="Object.keys(groupedPos).length === 0" class="text-center py-8 empty-state">
      <p class="text-lg mb-4">{{ emptyMessage || 'No Point of Sale options available' }}</p>
      <Button v-if="showRefresh" class="px-6 py-3 refresh-button" outlined @click="$emit('refresh')"> Refresh </Button>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4" :class="{ 'on-primary-bg': onPrimaryBackground }">
      <div
        v-for="(posGroup, ownerName) in groupedPos"
        :key="ownerName"
        class="space-y-2"
        :class="{ 'md:col-span-2': posGroup.length > 2 }"
      >
        <h4 class="text-lg font-medium font-semibold">{{ ownerName }}</h4>
        <div class="grid gap-3" :class="posGroup.length > 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'">
          <Button
            v-for="pos in posGroup"
            :key="pos.id"
            class="text-left justify-start h-auto py-3 px-4 pos-button"
            :class="{ 'is-outlined': currentPosId !== pos.id }"
            :disabled="switching"
            :outlined="currentPosId !== pos.id"
            @click="handlePosClick(pos)"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex flex-col items-start">
                <span class="font-semibold">{{ pos.name }}</span>
                <span v-if="currentPosId === pos.id" class="text-sm opacity-75">(Current)</span>
              </div>
              <i v-if="currentPosId === pos.id" class="pi pi-info-circle text-xl ml-2"></i>
            </div>
          </Button>
        </div>
      </div>
    </div>
  </div>
  <PosTokenInfoModal v-model="showModal" />
</template>

<script setup lang="ts">
import { PointOfSaleResponse } from '@sudosos/sudosos-client';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { ref } from 'vue';
import PosTokenInfoModal from '@/components/PosTokenInfoModal.vue';

interface Props {
  groupedPos: Record<string, PointOfSaleResponse[]>;
  currentPosId?: number | null;
  loading?: boolean;
  switching?: boolean;
  emptyMessage?: string;
  showRefresh?: boolean;
  onPrimaryBackground?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentPosId: null,
  loading: false,
  switching: false,
  emptyMessage: undefined,
  showRefresh: false,
  onPrimaryBackground: false,
});

const emit = defineEmits<{
  select: [pos: PointOfSaleResponse];
  refresh: [];
}>();

const handlePosClick = (pos: PointOfSaleResponse) => {
  if (props.switching) return;
  if (props.currentPosId === pos.id) {
    showModal.value = true;
    return;
  }
  emit('select', pos);
};

const showModal = ref(false);
</script>

<style scoped lang="scss">
.on-primary-bg {
  :deep(.pos-button.is-outlined) {
    // Outlined button on primary background
    border-color: var(--p-primary-inverse-color) !important;
    color: var(--p-primary-inverse-color) !important;
    background-color: transparent !important;

    &:hover:not(:disabled) {
      background-color: var(--p-primary-inverse-color) !important;
      color: var(--p-primary-color) !important;
    }
  }

  :deep(.pos-button:not(.is-outlined)) {
    // Filled button on primary background
    background-color: var(--p-primary-inverse-color) !important;
    color: var(--p-primary-color) !important;
    border-color: var(--p-primary-inverse-color) !important;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }
  }

  :deep(.refresh-button) {
    border-color: var(--p-primary-inverse-color) !important;
    color: var(--p-primary-inverse-color) !important;
    background-color: transparent !important;

    &:hover:not(:disabled) {
      background-color: var(--p-primary-inverse-color) !important;
      color: var(--p-primary-color) !important;
    }
  }
}
</style>
