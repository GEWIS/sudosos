<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<!-- eslint-disable @intlify/vue-i18n/no-missing-keys -->
<template>
  <div
    class="fixed inset-0 z-50 w-screen h-screen flex items-center justify-center sm:static sm:inset-auto sm:w-auto sm:h-auto sm:items-center sm:justify-center"
  >
    <div
      v-if="!isLoading"
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
        <div class="relative overflow-hidden flex-1">
          <div
            class="carousel-track h-full flex"
            :style="trackStyle"
            @lostpointercapture="onPointerUp"
            @pointercancel="onPointerUp"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
          >
            <div
              v-for="(card, index) in cardComponents"
              :key="index"
              class="card min-h-0 min-w-full p-4 flex flex-col justify-center items-start h-full rounded-none sm:rounded-4xl overflow-hidden"
            >
              <component :is="card" v-bind="cardProps[index]" :active="currentIndex === index" />
            </div>
          </div>
        </div>

        <WrappedControls
          :current-index="currentIndex"
          :show-arrows="showArrows"
          :total-cards="totalCards"
          @go="goTo"
          @next="next"
          @prev="prev"
        />
      </div>
    </div>
    <div v-else class="absolute inset-0 z-50 flex items-center justify-center p-4 sm:static sm:inset-auto sm:flex-1">
      <div class="flex flex-col items-center gap-3 text-center">
        <ProgressSpinner aria-label="Loading wrapped" stroke-width="6" style="width: 64px; height: 64px" />
        <div class="mt-4 text-lg font-medium">
          {{ t('views.wrapped.gettingReady', 'Getting your wrapped ready...') }}
        </div>
      </div>
    </div>
    <Dialog
      :closable="false"
      :draggable="false"
      :header="t('views.wrapped.dataAnalysisRequired', 'Data Analysis Required')"
      modal
      :style="{ width: '25rem' }"
      :visible="showDataAnalysisDialog"
    >
      <div class="flex flex-col gap-4">
        <p>
          {{
            t('views.wrapped.dataAnalysisMessage', 'You need to enable extensive data analysis to view your wrapped.')
          }}
        </p>
        <p class="text-sm text-gray-600">
          {{ t('views.wrapped.dataAnalysisSubtext', 'You can always disable this later in your settings.') }}
        </p>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <Button :label="t('common.cancel')" severity="secondary" @click="handleCancelDataAnalysis" />
          <Button
            :label="t('views.wrapped.enable', 'Enable')"
            :loading="isEnablingDataAnalysis"
            @click="handleEnableDataAnalysis"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick, onBeforeMount } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import type { ReportResponse } from '@sudosos/sudosos-client/src/api';
// eslint-disable-next-line import/no-named-as-default
import Dinero from 'dinero.js';
import type { WrappedResponse, UserResponse, ReportProductEntryResponse } from '@sudosos/sudosos-client';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import type { AxiosError } from 'axios';
import WelcomeCard from '@/components/wrapped/0_WelcomeCard.vue';
import TransactionsCard from '@/components/wrapped/1_TransactionsCard.vue';
import CalendarHeatmapCard from '@/components/wrapped/2_CalendarHeatmapCard.vue';
import TopProductCard from '@/components/wrapped/3_TopProductCard.vue';
import ProductsCard from '@/components/wrapped/4_ProductsCard.vue';
import TotalSpentCard from '@/components/wrapped/5_TotalSpentCard.vue';
import SpendingDistributionCard from '@/components/wrapped/6_SpendingDistributionCard.vue';
import FinalCard from '@/components/wrapped/7_FinalCard.vue';
import OrgansCard from '@/components/wrapped/8_OrgansCard.vue';
import OrgansOverviewCard from '@/components/wrapped/9_OrgansOverviewCard.vue';
import WrappedControls from '@/components/wrapped/Controls/WrappedControls.vue';
import apiService from '@/services/ApiService';
import { handleError } from '@/utils/errorUtils';
import posImage from '@/assets/img/wrapped/pos.png';
import bacImage from '@/assets/img/wrapped/BAC.png';
import ivvImage from '@/assets/img/wrapped/IVV.png';
import boomImage from '@/assets/img/wrapped/BOOM.png';
import athenaImage from '@/assets/img/wrapped/ATHENA.png';
import defiImage from '@/assets/img/wrapped/DEFI.png';

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();

const report = ref<ReportResponse>();
const report2024 = ref<ReportResponse>();
const wrapped = ref<WrappedResponse>();
const organDetails = ref<Record<number, UserResponse>>({});
const isLoading = ref(true);
const showDataAnalysisDialog = ref(false);
const isEnablingDataAnalysis = ref(false);

const transactionCount = computed(() => {
  return report.value?.transactionCount || 0;
});

const transactionCount2024 = computed(() => {
  return report2024.value?.transactionCount || 0;
});

const transactionPercentile = computed(() => {
  return wrapped.value?.transactions.transactionPercentile || 100;
});

const transactionHeatmap = computed(() => {
  return wrapped.value?.transactions.transactionHeatmap || [];
});

const transactionMaxDate = computed(() => {
  const maxDate = wrapped.value?.transactions.transactionMaxDate;
  return maxDate ? new Date(maxDate) : null;
});

const transactionMaxAmount = computed(() => {
  return wrapped.value?.transactions.transactionMaxAmount || 0;
});

const spentPercentile = computed(() => {
  return wrapped.value?.spentPercentile || 100;
});

const total = computed(() => {
  return report.value?.totalInclVat || { amount: 0, currency: 'EUR', precision: 2 };
});

const total2024 = computed(() => {
  return report2024.value?.totalInclVat || { amount: 0, currency: 'EUR', precision: 2 };
});

const totalBorrels = computed(() => {
  if (report.value == undefined) {
    return 0;
  }

  return Dinero(report.value.totalInclVat as Dinero.Options)
    .subtract(Dinero(report.value.data.pos!.find((p) => p.pos.id == 1)!.totalInclVat as Dinero.Options))
    .toObject();
});

const totalAlc = computed(() => {
  if (report.value == undefined) {
    return 0;
  }

  return report.value.data.categories!.find((p) => p.category.id == 1)?.totalInclVat.amount || 0;
});

const totalSoda = computed(() => {
  if (report.value == undefined) {
    return 0;
  }

  return report.value.data.categories!.find((p) => p.category.id == 2)?.totalInclVat.amount || 0;
});

const totalSnacks = computed(() => {
  if (report.value == undefined) {
    return 0;
  }

  return report.value.data.categories!.find((p) => p.category.id == 3)?.totalInclVat.amount || 0;
});

const favoriteProducts = computed(() => {
  if (report.value == undefined) {
    return [];
  }

  const productMap = new Map<number, ReportProductEntryResponse>();

  for (const productEntry of report.value.data.products || []) {
    const key = productEntry.product?.id;
    const existing = productMap.get(key);

    if (existing) {
      existing.count += productEntry.count;
      existing.product = productEntry.product;
    } else {
      productMap.set(key, { ...productEntry });
    }
  }

  const aggregated = Array.from(productMap.values());

  return aggregated.sort((a, b) => b.count - a.count).slice(0, 10);
});

const favoriteProduct = computed(() => {
  return favoriteProducts.value[0];
});

const organs = computed(() => {
  return wrapped.value?.organs || [];
});

const hasOrgans = computed(() => {
  return organs.value.length > 0;
});

const hasMultipleOrgans = computed(() => {
  return organs.value.length > 1;
});

const width = ref<number>(window.innerWidth);
const showArrows = computed(() => width.value >= 640);

const updateWindowWidth = () => {
  width.value = window.innerWidth;
};

const userFirstName = computed(() => {
  return authStore.getUser?.firstName;
});

type CardProps = Record<string, unknown>;

const cardProps = computed<CardProps[]>(() => {
  const props: CardProps[] = [
    { firstName: userFirstName.value, showArrows: showArrows.value },
    {
      transactionCount: transactionCount.value,
      previousTransactionCount: transactionCount2024.value,
      transactionPercentile: transactionPercentile.value,
    },
    {
      heatmap: transactionHeatmap.value,
      maxDate: transactionMaxDate.value,
      maxAmount: transactionMaxAmount.value,
    },
    {
      product: favoriteProduct.value,
    },
    {
      topFiveProducts: favoriteProducts.value.slice(0, 5),
    },
    {
      totalSpent: total.value,
      previousTotalSpent: total2024.value,
      totalSpentPercentile: spentPercentile.value,
    },
    {
      totalSpent: total.value,
      totalSpentBorrel: totalBorrels.value,
      totalSpentAlcohol: totalAlc.value,
      totalSpentSoda: totalSoda.value,
      totalSpentSnacks: totalSnacks.value,
    },
  ];

  if (hasOrgans.value) {
    const organName = organDetails.value[organs.value[0].organId]?.firstName;
    let image = posImage;
    let dark = true;
    switch (organName) {
      case 'BAC':
        image = bacImage;
        break;
      case 'I.V.V':
        image = ivvImage;
        break;
      case 'B.O.O.M':
        image = boomImage;
        dark = false;
        break;
      case 'ATHENA':
        image = athenaImage;
        break;
      case 'Défi':
        image = defiImage;
        break;
    }

    props.push({
      organs: organs.value,
      organDetails: organDetails.value,
      image: image,
      dark: dark,
    } as CardProps);
  }

  if (hasMultipleOrgans.value) {
    props.push({
      organs: organs.value,
      organDetails: organDetails.value,
    } as CardProps);
  }

  props.push({ showArrows: showArrows.value });
  return props;
});

const cardComponents = computed(() => {
  const base: unknown[] = [WelcomeCard, TransactionsCard, CalendarHeatmapCard, TopProductCard, ProductsCard];

  base.push(TotalSpentCard, SpendingDistributionCard);

  if (hasOrgans.value) {
    base.push(OrgansCard);
  }

  if (hasMultipleOrgans.value) {
    base.push(OrgansOverviewCard);
  }

  base.push(FinalCard);
  return base;
});

const currentIndex = ref(0);

const cardBackgrounds = computed(() => {
  const base = [
    '#b40000',
    '#ffffff',
    'linear-gradient(90deg, #0d1117 0%, #1f2937 100%)',
    'linear-gradient(135deg, #004ff9 0%, #000000 100%)',
    'linear-gradient(135deg, #662d8c 0%, #ed1e79 100%)',
  ];

  base.push('linear-gradient(45deg, #233329 0%, #63d471 100%)', 'linear-gradient(135deg, #ff8800 0%, #ff3300 100%)');

  if (hasOrgans.value) {
    const organName = organDetails.value[organs.value[0].organId]?.firstName;
    switch (organName) {
      case 'BAC':
        base.push('#004b31');
        break;
      case 'I.V.V':
        base.push('#14213d');
        break;
      case 'B.O.O.M':
        base.push('#9EFF00');
        break;
      case 'ATHENA':
        base.push('#d53d86');
        break;
      case 'Défi':
        base.push('#9678d3');
        break;
      default:
        base.push('#b40000');
    }
  }

  if (hasMultipleOrgans.value) {
    base.push('linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)');
  }

  base.push('linear-gradient(135deg, #b40000 0%, #004b31 100%)');
  return base;
});

const currentBackground = computed(() => cardBackgrounds.value[currentIndex.value] || '#b40000');

const totalCards = computed(() => cardComponents.value.length);

const prevBackground = ref<string | null>(null);
const prevFading = ref(false);
const bgFadeDuration = 420;

watch(currentIndex, async (newIndex, oldIndex) => {
  if (oldIndex === undefined || oldIndex === newIndex) return;
  prevBackground.value = cardBackgrounds.value[oldIndex];
  prevFading.value = false;

  await nextTick();
  prevFading.value = true;

  setTimeout(() => {
    prevBackground.value = null;
    prevFading.value = false;
  }, bgFadeDuration);
});

function clampIndex(i: number) {
  return Math.max(0, Math.min(i, totalCards.value - 1));
}

function next() {
  currentIndex.value = clampIndex(currentIndex.value + 1);
}
function prev() {
  currentIndex.value = clampIndex(currentIndex.value - 1);
}
function goTo(i: number) {
  currentIndex.value = clampIndex(i);
}

let pointerDown = false;
let dragging = false;
let startX = 0;
let currentX = 0;
let deltaX = 0;
let startY = 0;

const threshold = 25; // px to trigger a swipe

const trackStyle = computed(() => {
  const baseTranslate = -currentIndex.value * 100;
  if (dragging && deltaX !== 0) {
    // while dragging, don't animate so movement follows pointer
    return {
      transform: `translateX(calc(${baseTranslate}% + ${deltaX}px))`,
      transition: 'none',
    } as Record<string, string>;
  }

  // smooth transition when snapping to wrapped
  return {
    transform: `translateX(${baseTranslate}%)`,
    transition: 'transform 400ms cubic-bezier(.2,.8,.2,1)',
  } as Record<string, string>;
});

function onPointerDown(e: PointerEvent) {
  pointerDown = true;
  dragging = false;
  startX = e.clientX;
  startY = e.clientY;
  currentX = startX;
  deltaX = 0;
  (e.target as Element).setPointerCapture(e.pointerId);
}

function onPointerMove(e: PointerEvent) {
  if (!pointerDown) return;
  currentX = e.clientX;
  const dx = currentX - startX;
  const dy = e.clientY - startY;
  // if vertical scrolling is dominant, don't treat as horizontal swipe
  if (!dragging && Math.abs(dy) > Math.abs(dx)) {
    return;
  }
  dragging = true;
  deltaX = dx;
}

function onPointerUp(e: PointerEvent) {
  if (!pointerDown) return;
  pointerDown = false;
  (e.target as Element).releasePointerCapture(e.pointerId);

  if (!dragging) {
    deltaX = 0;
    return;
  }

  if (deltaX > threshold) {
    // swipe right -> previous
    prev();
  } else if (deltaX < -threshold) {
    // swipe left -> next
    next();
  }

  // reset drag state
  deltaX = 0;
  dragging = false;
}

async function loadWrappedData() {
  const userId = authStore.getUser!.id;

  report.value = (await apiService.user.getUsersPurchasesReport(userId, '2025-01-01', '2025-12-31')).data;

  report2024.value = (await apiService.user.getUsersPurchasesReport(userId, '2024-01-01', '2024-12-31')).data;

  wrapped.value = (await apiService.user.getWrapped(userId)).data;

  // Fetch organ details
  if (wrapped.value?.organs && wrapped.value.organs.length > 0) {
    const organDetailsMap: Record<number, UserResponse> = {};
    await Promise.all(
      wrapped.value.organs.map(async (organ) => {
        try {
          const response = await apiService.user.getIndividualUser(organ.organId);
          organDetailsMap[organ.organId] = response.data;
        } catch (e) {
          console.error(`Failed to fetch organ ${organ.organId}`, e);
        }
      }),
    );
    organDetails.value = organDetailsMap;
  }
}

onBeforeMount(async () => {
  isLoading.value = true;
  try {
    const user = authStore.getUser;
    if (!user?.extensiveDataProcessing) {
      showDataAnalysisDialog.value = true;
      isLoading.value = false;
      return;
    }

    await loadWrappedData();
  } catch (e) {
    console.error('Failed to load wrapped data', e);
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
    const userId = authStore.getUser!.id;

    // Update user preference
    await apiService.user.updateUser(userId, { extensiveDataProcessing: true });

    isLoading.value = true;
    showDataAnalysisDialog.value = false;
    await apiService.user.updateWrapped(userId);
    await loadWrappedData();

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

onMounted(() => {
  window.addEventListener('resize', updateWindowWidth);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateWindowWidth);
});

const { t } = useI18n();
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
