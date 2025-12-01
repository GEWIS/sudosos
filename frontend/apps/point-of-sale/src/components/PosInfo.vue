<template>
  <div class="font-bold opacity-30 text-black">
    <b>{{ pointOfSale?.name || 'Unknown POS' }}</b>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { usePointOfSaleStore } from '@/stores/pos.store';

const { pointOfSale } = storeToRefs(usePointOfSaleStore());
</script>
