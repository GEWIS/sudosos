<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content">
      <h2 class="text-2xl mb-5">Your <span class="font-bold">top organs</span> were:</h2>
      <div class="grid gap-2">
        <div
          v-for="(organ, index) in wrapped.organs"
          :key="organ.organId"
          :aria-hidden="step <= index"
          class="w-full p-2 rounded-lg fade-slide"
          :class="organ === bestOrgan(wrapped) ? 'bg-white/50 border-2 border-white/60' : 'bg-white/30'"
        >
          <h3 class="font-bold text-xl">{{ organName(organ) }}</h3>
          <h4 v-if="organ.ordinalTurnoverCreated === organ.ordinalTransactionCreated">
            Number <span class="font-bold">{{ organ.ordinalTurnoverCreated + 1 }}</span> seller and transactions created
          </h4>
          <h4 v-else>
            Number <span class="font-bold">{{ organ.ordinalTurnoverCreated + 1 }}</span> seller & number
            <span class="font-bold">{{ organ.ordinalTransactionCreated + 1 }}</span> in transactions
          </h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { bestOrgan, organName } from '@/utils/wrappedUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse }>();

const { step } = useCardReveal(
  () => props.active,
  props.wrapped.organs.map((_, index) => (index === 0 ? 500 : 800)),
);
</script>
