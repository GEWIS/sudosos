<template>
  <PageContainer class="items-center flex flex-col max-w-[100rem]">
    <div class="flex flex-col gap-5 max-w-[75rem] w-full">
      <FineRound :key="`round-${refreshKey}`" @completed="refreshKey++" />
      <DebtorHandouts :key="refreshKey" />
    </div>
  </PageContainer>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import DebtorHandouts from '@/modules/financial/components/debtor/DebtorHandouts.vue';
import FineRound from '@/modules/financial/components/debtor/FineRound.vue';
import PageContainer from '@/layout/PageContainer.vue';

// Remount after a fine round, so the round starts over and the handout history shows the new handout
const refreshKey = ref(0);
</script>

<style scoped lang="scss"></style>
