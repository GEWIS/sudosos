<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content">
      <h2 class="text-2xl mb-5">Your <span class="font-bold">organs</span> were:</h2>
      <div class="grid gap-2">
        <div
          v-for="(organInfo, index) in organsWithInfo"
          :key="organInfo.organId"
          :aria-hidden="!isRevealed(index)"
          class="w-full flex flex-row items-center p-2 rounded-lg item fade-slide"
          :style="{
            backgroundColor: organInfo.organId === bestOrganId ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.3)',
            border: organInfo.organId === bestOrganId ? '2px solid rgba(255,255,255,0.6)' : 'none',
          }"
        >
          <div class="w-full">
            <h3 class="font-bold text-xl">{{ organInfo.organName }}</h3>
            <h4>
              <template
                v-if="
                  organInfo.ordinalTransactionCreated >= 0 &&
                  organInfo.ordinalTurnoverCreated + 1 === organInfo.ordinalTransactionCreated + 1
                "
              >
                Number <span class="font-bold">{{ organInfo.ordinalTurnoverCreated + 1 }}</span> seller and transactions
                created
              </template>
              <template v-else>
                Number <span class="font-bold">{{ organInfo.ordinalTurnoverCreated + 1 }}</span> seller
                <span v-if="organInfo.ordinalTransactionCreated >= 0">
                  , number <span class="font-bold">{{ organInfo.ordinalTransactionCreated + 1 }}</span> in transactions
                </span>
              </template>
            </h4>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, toRef, ref, watch, computed, type ComputedRef, unref } from 'vue';
import type { UserResponse } from '@sudosos/sudosos-client';

interface OrganInfo {
  organId: number;
  organName: string;
  ordinalTransactionCreated: number;
  ordinalTurnoverCreated: number;
}

const props = defineProps<{
  active?: boolean;
  organs:
    | ComputedRef<
        Array<{
          organId: number;
          ordinalTransactionCreated: number;
          ordinalTurnoverCreated: number;
        }>
      >
    | Array<{
        organId: number;
        ordinalTransactionCreated: number;
        ordinalTurnoverCreated: number;
      }>;
  organDetails: ComputedRef<Record<number, UserResponse>> | Record<number, UserResponse>;
}>();

const organs = computed(() => unref(props.organs));
const organDetails = computed(() => unref(props.organDetails));

const organsWithInfo = computed<OrganInfo[]>(() => {
  return organs.value.map((organ) => {
    const detail = organDetails.value[organ.organId];
    return {
      organId: organ.organId,
      organName: detail ? `${detail.firstName} ${detail.lastName}` : `Organ #${organ.organId}`,
      ordinalTransactionCreated: organ.ordinalTransactionCreated,
      ordinalTurnoverCreated: organ.ordinalTurnoverCreated,
    };
  });
});

const bestOrganId = computed<number | null>(() => {
  const validOrgans = organsWithInfo.value.filter((o) => o.ordinalTurnoverCreated >= 0);
  if (validOrgans.length === 0) return null;
  const best = validOrgans.reduce((best, current) => {
    return current.ordinalTurnoverCreated < best.ordinalTurnoverCreated ? current : best;
  });
  return best.organId;
});

const active = toRef(props, 'active');

const revealed = ref(new Set<number>());
let animationToken = 0;
const REVEAL_INTERVAL = 800;
const FIRST_REVEAL_DELAY = 500;
const hasPlayed = ref(false);

function isRevealed(index: number) {
  return revealed.value.has(index);
}

function resetAnimationState() {
  animationToken++;
  revealed.value = new Set<number>();
  hasPlayed.value = false;
}

async function runAnimation(token: number) {
  await new Promise((res) => setTimeout(res, FIRST_REVEAL_DELAY));
  if (token !== animationToken) return;

  for (let i = 0; i < organsWithInfo.value.length; i++) {
    if (token !== animationToken) return;
    revealed.value.add(i);
    await new Promise((res) => setTimeout(res, REVEAL_INTERVAL));
  }
  if (token !== animationToken) return;
  hasPlayed.value = true;
}

watch(
  active,
  (v) => {
    if (v) {
      if (!hasPlayed.value) {
        resetAnimationState();
        const token = animationToken;
        setTimeout(() => void runAnimation(token), 40);
      } else {
        revealed.value = new Set(organsWithInfo.value.map((_, i) => i));
      }
    }
  },
  { immediate: false },
);
</script>
<style scoped lang="scss"></style>
