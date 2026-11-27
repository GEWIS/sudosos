<template>
  <div class="card-root" :class="[{ active }, dark ? 'text-white' : 'text-black']">
    <div class="bg seller-bg" :style="{ backgroundImage: `url('${image}')` }"></div>
    <WrappedConfetti v-if="active && organ.ordinalTurnoverCreated === 0 && step >= 2" />
    <div class="content">
      <i18n-t
        :aria-hidden="step < 1"
        class="text-2xl mb-4 fade-slide"
        keypath="components.wrapped.organs.workedFor"
        scope="global"
        tag="h2"
      >
        <template #organ>
          <span class="font-bold">{{ organName(organ) }}</span>
        </template>
      </i18n-t>
      <i18n-t
        v-if="organ.ordinalTurnoverCreated < PODIUM"
        :aria-hidden="step < 2"
        class="text-4xl mb-4 fade-slide"
        keypath="components.wrapped.organs.sellerRank"
        scope="global"
        tag="h1"
      >
        <template #rank>
          <span class="mark font-bold">
            {{ t('components.wrapped.organs.rank', { rank: organ.ordinalTurnoverCreated + 1 }) }}
          </span>
        </template>
      </i18n-t>
      <i18n-t
        v-else-if="topShare <= 50"
        :aria-hidden="step < 2"
        class="text-4xl mb-4 fade-slide"
        keypath="components.wrapped.organs.topShare"
        scope="global"
        tag="h1"
      >
        <template #top>
          <span class="mark font-bold">{{ t('components.wrapped.top', { percentile: topShare }) }}</span>
        </template>
      </i18n-t>
      <i18n-t
        :aria-hidden="step < 3"
        class="text-xl fade-slide"
        keypath="components.wrapped.organs.totals"
        scope="global"
        tag="h3"
      >
        <template #transactions>
          <span class="font-bold">{{ organ.transactionsCreated.toLocaleString(locale) }}</span>
        </template>
        <template #customers>
          <span class="font-bold">{{ organ.customersServed.toLocaleString(locale) }}</span>
        </template>
        <template #turnover>
          <span class="font-bold">{{ formatDineroObject(organ.turnoverCreated) }}</span>
        </template>
      </i18n-t>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WrappedOrganMemberResponse } from '@gewis/sudosos-client';
import WrappedConfetti from '@/components/wrapped/WrappedConfetti.vue';
import { useCardReveal } from '@/composables/wrappedCard';
import { formatDineroObject } from '@/utils/formatterUtils';
import { organName } from '@/utils/wrappedUtils';

const props = defineProps<{
  active?: boolean;
  organ: WrappedOrganMemberResponse;
  image: string;
  dark: boolean;
}>();

const { t, locale } = useI18n();

const PODIUM = 3;

const topShare = computed(() => Math.ceil(((props.organ.ordinalTurnoverCreated + 1) / props.organ.sellerCount) * 100));

const { step } = useCardReveal(() => props.active, [500, 1500, 800]);
</script>

<style scoped lang="scss">
.seller-bg {
  background-size: 90%;
  opacity: 0.3;
  transform: rotate(-8deg);
}
</style>
