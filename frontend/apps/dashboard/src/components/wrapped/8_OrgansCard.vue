<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <div ref="rootRef" class="card-root" :class="{ active, 'text-black': !props.dark, 'text-white': props.dark }">
    <div class="bg seller-bg" :style="{ '--bg-image': `url('${image}')` }"></div>
    <div class="content">
      <div v-if="bestOrgan" :aria-hidden="!showOrganName" class="fade-slide">
        <h2 class="text-2xl mb-4">
          You worked hard for <span class="font-bold">{{ bestOrgan.organName }}</span
          >!
        </h2>
      </div>
      <div v-if="bestOrgan" :aria-hidden="!showSellerRank" class="fade-slide">
        <h1 class="text-4xl mb-4">
          You were their
          <span class="font-bold">number {{ bestOrgan.ordinalTurnoverCreated + 1 }}</span>
          seller!
        </h1>
      </div>
      <div
        v-if="bestOrgan && bestOrgan.ordinalTransactionCreated >= 0"
        :aria-hidden="!showTransactionRank"
        class="fade-slide"
      >
        <h3 class="text-xl">
          And also the <span class="font-bold">number {{ bestOrgan.ordinalTransactionCreated + 1 }}</span> in their
          transactions created!
        </h3>
      </div>
      <div v-if="!bestOrgan" :aria-hidden="!showOrganName" class="fade-slide">
        <h2 class="text-2xl">You worked hard as a seller!</h2>
        <h1 class="text-4xl font-bold mt-4">Congratulations!</h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { UserResponse } from '@sudosos/sudosos-client';

interface OrganInfo {
  organId: number;
  organName: string;
  ordinalTransactionCreated: number;
  ordinalTurnoverCreated: number;
}

const props = defineProps<{
  active?: boolean;
  organs: Array<{
    organId: number;
    ordinalTransactionCreated: number;
    ordinalTurnoverCreated: number;
  }>;
  organDetails: Record<number, UserResponse>;
  image: string;
  dark: boolean;
}>();

const active = toRef(props, 'active');
const organs = toRef(props, 'organs');
const organDetails = toRef(props, 'organDetails');
const image = toRef(props, 'image');

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

const bestOrgan = computed<OrganInfo | null>(() => {
  if (organsWithInfo.value.length === 0) return null;
  // Find organ with lowest (best) ordinalTurnoverCreated
  // Filter out organs with negative values (not sellers)
  const validOrgans = organsWithInfo.value.filter((o) => o.ordinalTurnoverCreated >= 0);
  if (validOrgans.length === 0) return null;
  return validOrgans.reduce((best, current) => {
    return current.ordinalTurnoverCreated < best.ordinalTurnoverCreated ? current : best;
  });
});

const rootRef = ref<HTMLElement | null>(null);
const showOrganName = ref(false);
const showSellerRank = ref(false);
const showTransactionRank = ref(false);
let observer: IntersectionObserver | null = null;
let revealTimeouts: number[] = [];

const hasPlayed = ref(false);

const ORGAN_NAME_DELAY = 500;
const DRAMATIC_PAUSE = 1500;
const SELLER_RANK_DELAY = 800;

function resetAnimationState() {
  revealTimeouts.forEach((timeout) => clearTimeout(timeout));
  revealTimeouts = [];
  showOrganName.value = false;
  showSellerRank.value = false;
  showTransactionRank.value = false;
}

function tryStartReveal() {
  if (!active.value) return;

  // If we've already played the full animation once, immediately show final state
  if (hasPlayed.value) {
    showOrganName.value = true;
    showSellerRank.value = true;
    showTransactionRank.value = !!(bestOrgan.value && bestOrgan.value.ordinalTransactionCreated >= 0);
    return;
  }

  // start from a clean slate
  resetAnimationState();

  if (!bestOrgan.value) {
    const timeout = window.setTimeout(() => {
      showOrganName.value = true;
      hasPlayed.value = true; // mark as played once the reveal finished
    }, ORGAN_NAME_DELAY);
    revealTimeouts.push(timeout);
    return;
  }

  // Capture current bestOrgan so changes during the animation don't affect timing
  const localBest = bestOrgan.value;

  // Show organ name
  const timeout1 = window.setTimeout(() => {
    showOrganName.value = true;
  }, ORGAN_NAME_DELAY);
  revealTimeouts.push(timeout1);

  // Dramatic pause, then show seller rank
  const timeout2 = window.setTimeout(() => {
    showSellerRank.value = true;
  }, ORGAN_NAME_DELAY + DRAMATIC_PAUSE);
  revealTimeouts.push(timeout2);

  // Show transaction rank if applicable; mark hasPlayed after the final reveal
  if (localBest && localBest.ordinalTransactionCreated >= 0) {
    const timeout3 = window.setTimeout(
      () => {
        showTransactionRank.value = true;
        hasPlayed.value = true; // mark as played once the final reveal finished
      },
      ORGAN_NAME_DELAY + DRAMATIC_PAUSE + SELLER_RANK_DELAY,
    );
    revealTimeouts.push(timeout3);
  } else {
    // No transaction rank to show — mark played after seller rank
    const timeoutFinal = window.setTimeout(
      () => {
        hasPlayed.value = true;
      },
      ORGAN_NAME_DELAY + DRAMATIC_PAUSE + 10,
    );
    revealTimeouts.push(timeoutFinal);
  }
}

onMounted(() => {
  if (!rootRef.value) return;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 1) {
          tryStartReveal();
          if (observer) {
            observer.disconnect();
            observer = null;
          }
        }
      }
    },
    { threshold: [1.0] },
  );

  observer.observe(rootRef.value);
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  // clear any pending timeouts and bump token to cancel
  resetAnimationState();
});

watch(
  () => bestOrgan.value,
  () => {
    if (active.value && rootRef.value) {
      const rect = rootRef.value.getBoundingClientRect();
      const fullyVisible =
        rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
      if (fullyVisible) tryStartReveal();
    }
  },
);

watch(active, (val) => {
  if (!val) {
    // if the card becomes inactive while animating, cancel pending reveals
    resetAnimationState();
    return;
  }

  if (val && rootRef.value) {
    const rect = rootRef.value.getBoundingClientRect();
    const fullyVisible = rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight);
    if (fullyVisible) tryStartReveal();
  }
});
</script>

<style scoped lang="scss">
.seller-bg {
  background-image: var(--bg-image);
  background-size: 90%;
  opacity: 0.3;
  transform: rotate(-8deg);
}
</style>
