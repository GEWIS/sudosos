<template>
  <PageContainer class="items-center flex flex-col max-w-[100rem]">
    <div class="flex flex-col gap-5 max-w-[65rem] w-full">
      <Transition mode="out-in" :name="transitionName">
        <FineRound v-if="fineRoundActive" @cancel="closeFineRound(false)" @completed="closeFineRound(true)" />
        <DebtorOverview v-else @start-fine-round="openFineRound" />
      </Transition>
      <DebtorHandouts :key="refreshKey" />
    </div>
  </PageContainer>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import DebtorHandouts from '@/modules/financial/components/debtor/DebtorHandouts.vue';
import DebtorOverview from '@/modules/financial/components/debtor/DebtorOverview.vue';
import FineRound from '@/modules/financial/components/debtor/FineRound.vue';
import PageContainer from '@/layout/PageContainer.vue';

// Remount the handouts after a fine round to show the new handout; the overview remounts anyway
// because it is swapped out while the round runs
const refreshKey = ref(0);
const fineRoundActive = ref(false);
const transitionName = ref<'slide-left' | 'slide-right'>('slide-left');

function openFineRound() {
  transitionName.value = 'slide-left';
  fineRoundActive.value = true;
}

function closeFineRound(completed: boolean) {
  transitionName.value = 'slide-right';
  fineRoundActive.value = false;
  if (completed) refreshKey.value++;
}
</script>

<style scoped lang="scss">
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.slide-left-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(2rem);
}

.slide-left-leave-to,
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-2rem);
}

@media (prefers-reduced-motion: reduce) {
  .slide-left-enter-active,
  .slide-left-leave-active,
  .slide-right-enter-active,
  .slide-right-leave-active {
    transition: none;
  }
}
</style>
