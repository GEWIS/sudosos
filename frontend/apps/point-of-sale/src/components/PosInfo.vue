<template>
  <div class="font-bold opacity-30 text-black" @click="showModal = true">
    <b>{{ pointOfSale?.name || 'Unknown POS' }}</b>
  </div>
  <PosTokenInfoModal v-model="showModal" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { usePointOfSaleStore } from '@/stores/pos.store';
import PosTokenInfoModal from './PosTokenInfoModal.vue';

const { pointOfSale } = storeToRefs(usePointOfSaleStore());
const showModal = ref(false);
</script>
