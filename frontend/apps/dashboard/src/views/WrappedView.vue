<template>
  <div
    class="fixed inset-0 z-50 w-screen h-dvh flex items-center justify-center sm:static sm:inset-auto sm:w-auto sm:h-auto sm:items-center sm:justify-center"
  >
    <div
      v-if="wrapped"
      class="w-full rounded-none sm:rounded-4xl sm:shadow-2xl h-full p-4 flex flex-col sm:h-160 sm:w-96 overflow-hidden relative"
    >
      <div class="bg-container absolute inset-0 pointer-events-none">
        <div
          v-if="prevBackground"
          class="bg-layer absolute inset-0 bg-cover bg-center prev"
          :class="{ fading: prevFading }"
          :style="{ background: prevBackground }"
        />

        <div class="bg-layer absolute inset-0 bg-cover bg-center current" :style="{ background: currentBackground }" />
      </div>

      <div class="card-content relative z-10 flex flex-col h-full">
        <div class="flex items-center gap-3" :class="cards[currentIndex].dark === false ? 'text-black' : 'text-white'">
          <WrappedProgress
            class="flex-1"
            :count="cards.length"
            :current="currentIndex"
            :duration="progressDuration"
            :paused="paused"
            @complete="next"
          />
          <button
            :aria-label="t('components.wrapped.controls.close')"
            class="cursor-pointer"
            type="button"
            @click="close"
          >
            <i aria-hidden="true" class="pi pi-times"></i>
          </button>
        </div>

        <div ref="viewport" class="relative overflow-hidden flex-1">
          <div
            class="carousel-track h-full flex"
            :style="trackStyle"
            @lostpointercapture="cancelPointer"
            @pointercancel="cancelPointer"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
          >
            <div
              v-for="(card, index) in cards"
              :key="index"
              class="card min-h-0 min-w-full p-4 flex flex-col justify-center items-start h-full rounded-none sm:rounded-4xl overflow-hidden"
            >
              <component
                :is="card.component"
                v-bind="card.props"
                :active="currentIndex === index"
                :show-arrows="showArrows"
                :wrapped="wrapped"
              />
            </div>
          </div>
        </div>

        <WrappedControls
          v-if="showArrows"
          :current-index="currentIndex"
          :total-cards="cards.length"
          @next="advance"
          @prev="prev"
        />
      </div>
    </div>
    <div
      v-else-if="isLoading"
      class="absolute inset-0 z-50 flex items-center justify-center p-4 sm:static sm:inset-auto sm:flex-1"
    >
      <div class="flex flex-col items-center gap-3 text-center">
        <ProgressSpinner
          :aria-label="t('components.wrapped.loading')"
          stroke-width="6"
          style="width: 64px; height: 64px"
        />
        <div class="mt-4 text-lg font-medium">
          {{ t('components.wrapped.loading') }}
        </div>
      </div>
    </div>
    <Dialog
      :closable="false"
      :draggable="false"
      :header="t('components.wrapped.consent.header')"
      modal
      :style="{ width: '25rem' }"
      :visible="showDataAnalysisDialog"
    >
      <div class="flex flex-col gap-4">
        <p>
          {{ t('components.wrapped.consent.message') }}
        </p>
        <p class="text-sm text-gray-600">
          {{ t('components.wrapped.consent.subtext') }}
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button :label="t('common.cancel')" severity="secondary" @click="handleCancelDataAnalysis" />
          <Button
            :label="t('components.wrapped.consent.enable')"
            :loading="isEnablingDataAnalysis"
            @click="handleEnableDataAnalysis"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  shallowRef,
  computed,
  watch,
  nextTick,
  provide,
  onBeforeMount,
  onMounted,
  onBeforeUnmount,
  type Component,
} from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useI18n } from 'vue-i18n';
import { useToast } from 'openvue/usetoast';
import { useRouter } from 'vue-router';
import type { AxiosError } from 'axios';
import WelcomeCard from '@/components/wrapped/WelcomeCard.vue';
import TransactionsCard from '@/components/wrapped/TransactionsCard.vue';
import CalendarHeatmapCard from '@/components/wrapped/CalendarHeatmapCard.vue';
import TopProductCard from '@/components/wrapped/TopProductCard.vue';
import ProductsCard from '@/components/wrapped/ProductsCard.vue';
import TotalSpentCard from '@/components/wrapped/TotalSpentCard.vue';
import SpendingDistributionCard from '@/components/wrapped/SpendingDistributionCard.vue';
import FinalCard from '@/components/wrapped/FinalCard.vue';
import OrgansCard from '@/components/wrapped/OrgansCard.vue';
import OrgansOverviewCard from '@/components/wrapped/OrgansOverviewCard.vue';
import WrappedControls from '@/components/wrapped/Controls/WrappedControls.vue';
import WrappedProgress from '@/components/wrapped/Controls/WrappedProgress.vue';
import { activeRevealKey, type CardReveal } from '@/composables/wrappedCard';
import { useSizeBreakpoints } from '@/composables/sizeBreakpoints';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import { bestOrgan } from '@/utils/wrappedUtils';
import posImage from '@/assets/img/wrapped/pos.png';
import bacImage from '@/assets/img/wrapped/BAC.webp';
import ivvImage from '@/assets/img/wrapped/IVV.png';
import boomImage from '@/assets/img/wrapped/BOOM.webp';
import athenaImage from '@/assets/img/wrapped/ATHENA.webp';
import defiImage from '@/assets/img/wrapped/DEFI.webp';

interface Card {
  component: Component;
  background: string;
  dark?: boolean;
  props?: Record<string, unknown>;
}

interface OrganTheme {
  image: string;
  background: string;
  dark: boolean;
}

const organThemes: Record<string, OrganTheme> = {
  BAC: { image: bacImage, background: '#004b31', dark: true },
  'I.V.V': { image: ivvImage, background: '#14213d', dark: true },
  'B.O.O.M': { image: boomImage, background: '#9EFF00', dark: false },
  ATHENA: { image: athenaImage, background: '#d53d86', dark: true },
  Défi: { image: defiImage, background: '#9678d3', dark: true },
};
const defaultOrganTheme: OrganTheme = { image: posImage, background: '#b40000', dark: true };

const { t } = useI18n();
const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();
const { isSm: showArrows } = useSizeBreakpoints();

const wrapped = ref<WrappedResponse>();
const isLoading = ref(true);
const showDataAnalysisDialog = ref(false);
const isEnablingDataAnalysis = ref(false);

const cards = computed<Card[]>(() => {
  if (!wrapped.value) return [];

  const deck: Card[] = [
    { component: WelcomeCard, background: '#b40000', props: { firstName: authStore.getUser?.firstName } },
    { component: TransactionsCard, background: '#ffffff', dark: false },
    { component: CalendarHeatmapCard, background: 'linear-gradient(90deg, #0d1117 0%, #1f2937 100%)' },
  ];
  if (wrapped.value.topProducts.length > 0) {
    deck.push(
      { component: TopProductCard, background: 'linear-gradient(135deg, #004ff9 0%, #000000 100%)' },
      { component: ProductsCard, background: 'linear-gradient(135deg, #662d8c 0%, #ed1e79 100%)' },
    );
  }
  deck.push(
    { component: TotalSpentCard, background: 'linear-gradient(45deg, #233329 0%, #63d471 100%)' },
    { component: SpendingDistributionCard, background: 'linear-gradient(135deg, #ff8800 0%, #ff3300 100%)' },
  );

  const organ = bestOrgan(wrapped.value);
  if (organ) {
    const theme = organThemes[organ.organ.firstName] ?? defaultOrganTheme;
    deck.push({
      component: OrgansCard,
      background: theme.background,
      dark: theme.dark,
      props: { organ, image: theme.image, dark: theme.dark },
    });
  }
  if (wrapped.value.organs.length > 1) {
    deck.push({ component: OrgansOverviewCard, background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' });
  }

  deck.push({ component: FinalCard, background: 'linear-gradient(135deg, #b40000 0%, #004b31 100%)' });
  return deck;
});

const currentIndex = ref(0);
const currentBackground = computed(() => cards.value[currentIndex.value]?.background);

const prevBackground = ref<string | null>(null);
const prevFading = ref(false);
const bgFadeDuration = 420;

watch(currentIndex, async (newIndex, oldIndex) => {
  if (oldIndex === newIndex) return;
  prevBackground.value = cards.value[oldIndex].background;
  prevFading.value = false;

  await nextTick();
  prevFading.value = true;

  setTimeout(() => {
    prevBackground.value = null;
    prevFading.value = false;
  }, bgFadeDuration);
});

function goTo(index: number) {
  currentIndex.value = Math.max(0, Math.min(index, cards.value.length - 1));
}
function next() {
  goTo(currentIndex.value + 1);
}
function prev() {
  goTo(currentIndex.value - 1);
}

const READ_TIME = 5000;
const HOLD_TIME = 250;
const SWIPE_DISTANCE = 25;
const BACK_ZONE = 0.3;

const activeReveal = shallowRef<CardReveal>();
provide(activeRevealKey, activeReveal);

const paused = ref(false);
const progressDuration = ref(0);

watch(activeReveal, (reveal) => {
  const stays =
    !reveal ||
    currentIndex.value === cards.value.length - 1 ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  progressDuration.value = stays ? 0 : (reveal.done.value ? 0 : reveal.duration) + READ_TIME;
});

/**
 * Completes the reveal of the current card, or moves on when it is complete already.
 */
function advance() {
  const reveal = activeReveal.value;
  if (reveal && !reveal.done.value) reveal.finish();
  else next();
}

function close() {
  void router.push({ name: 'home' });
}

const viewport = ref<HTMLElement>();
const drag = ref<{ x: number; y: number; offset: number }>();
let holdTimer = 0;

const trackStyle = computed(() => ({
  transform: `translateX(calc(${-currentIndex.value * 100}% + ${drag.value?.offset ?? 0}px))`,
  transition: drag.value?.offset ? 'none' : 'transform 400ms cubic-bezier(.2,.8,.2,1)',
}));

function onPointerDown(e: PointerEvent) {
  if ((e.target as Element).closest('button, a')) return;
  drag.value = { x: e.clientX, y: e.clientY, offset: 0 };
  holdTimer = window.setTimeout(() => (paused.value = true), HOLD_TIME);
  (e.currentTarget as Element).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!drag.value) return;
  const dx = e.clientX - drag.value.x;
  const dy = e.clientY - drag.value.y;
  if (drag.value.offset === 0 && Math.abs(dy) > Math.abs(dx)) return;
  drag.value.offset = dx;
}

function cancelPointer() {
  clearTimeout(holdTimer);
  paused.value = false;
  drag.value = undefined;
}

function onPointerUp(e: PointerEvent) {
  if (!drag.value || !viewport.value) return;
  const { offset } = drag.value;
  const held = paused.value;
  cancelPointer();

  if (offset > SWIPE_DISTANCE) prev();
  else if (offset < -SWIPE_DISTANCE) next();
  else if (!held) {
    const { left, width } = viewport.value.getBoundingClientRect();
    if (e.clientX - left < width * BACK_ZONE) prev();
    else advance();
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!wrapped.value) return;
  if (e.key === 'ArrowRight') advance();
  else if (e.key === 'ArrowLeft') prev();
  else if (e.key === 'Escape') close();
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

async function loadWrapped() {
  wrapped.value = (await apiService.user.updateWrapped({ id: authStore.getUser!.id })).data;
}

onBeforeMount(async () => {
  if (!authStore.getUser?.extensiveDataProcessing) {
    showDataAnalysisDialog.value = true;
    isLoading.value = false;
    return;
  }

  try {
    await loadWrapped();
  } catch (err: unknown) {
    handleError(err as AxiosError, toast);
  } finally {
    isLoading.value = false;
  }
});

function handleCancelDataAnalysis() {
  showDataAnalysisDialog.value = false;
  void router.push({ name: 'home' });
}

async function handleEnableDataAnalysis() {
  isEnablingDataAnalysis.value = true;
  try {
    await apiService.user.updateUser({
      id: authStore.getUser!.id,
      updateUserRequest: { extensiveDataProcessing: true },
    });

    isLoading.value = true;
    showDataAnalysisDialog.value = false;
    await loadWrapped();

    toast.add({
      severity: 'success',
      summary: t('common.toast.success.success'),
      detail: t('common.toast.success.dataAnalysis'),
      life: 5000,
    });
  } catch (err: unknown) {
    handleError(err as AxiosError, toast);
  } finally {
    isEnablingDataAnalysis.value = false;
    isLoading.value = false;
  }
}
</script>

<style>
.carousel-track {
  will-change: transform;
  touch-action: pan-y;
  transition: transform 400ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.bg-layer {
  opacity: 1;
  background-repeat: no-repeat;
  background-position: center right;
  background-size: cover;
  pointer-events: none;
}

.bg-layer.current {
  z-index: 0; /* underneath while prev fades out on top */
}

.bg-layer.prev {
  z-index: 1;
  opacity: 1;
  transition: opacity 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.bg-layer.prev.fading {
  opacity: 0;
}

/* Used in child cards */
.card-root {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1rem;
  box-sizing: border-box;
  transition:
    transform 420ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 340ms ease;
  transform: translateY(10px) scale(0.99);
}

.card-root.active {
  transform: translateY(0) scale(1);
  opacity: 1;
}

.bg {
  position: absolute;
  inset: 0;
  background-repeat: no-repeat;
  background-position: center right;
  pointer-events: none;
  z-index: 1;
}

.content {
  position: relative;
  z-index: 2;
  margin-left: auto;
  margin-right: auto;
}

.fade-slide {
  opacity: 0;
  transform: translateY(6px);
  transition:
    opacity 240ms ease,
    transform 240ms ease;
  pointer-events: none;
}
.fade-slide[aria-hidden='false'] {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
</style>
