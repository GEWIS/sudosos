<template>
  <div class="font-bold opacity-30 text-black">
    <b>{{ posStore.getPos?.name || 'Unknown POS' }}</b>
  </div>
</template>

<script setup lang="ts">
import { usePointOfSaleStore } from '@/stores/pos.store';

const posStore = usePointOfSaleStore();
</script>
