<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root" :class="[{ active }, dark ? 'text-white' : 'text-black']">
    <div class="bg seller-bg" :style="{ backgroundImage: `url('${image}')` }"></div>
    <div class="content">
      <h2 :aria-hidden="step < 1" class="text-2xl mb-4 fade-slide">
        You worked hard for <span class="font-bold">{{ organName(organ) }}</span
        >!
      </h2>
      <h1 :aria-hidden="step < 2" class="text-4xl mb-4 fade-slide">
        You were their
        <span class="font-bold">number {{ organ.ordinalTurnoverCreated + 1 }}</span>
        seller!
      </h1>
      <h3 :aria-hidden="step < 3" class="text-xl fade-slide">
        And also the <span class="font-bold">number {{ organ.ordinalTransactionCreated + 1 }}</span> in their
        transactions created!
      </h3>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WrappedOrganMemberResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { organName } from '@/utils/wrappedUtils';

const props = defineProps<{
  active?: boolean;
  organ: WrappedOrganMemberResponse;
  image: string;
  dark: boolean;
}>();

const { step } = useCardReveal(() => props.active, [500, 1500, 800]);
</script>

<style scoped lang="scss">
.seller-bg {
  background-size: 90%;
  opacity: 0.3;
  transform: rotate(-8deg);
}
</style>
