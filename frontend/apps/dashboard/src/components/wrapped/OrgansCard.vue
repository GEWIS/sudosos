<template>
  <div class="card-root" :class="[{ active }, dark ? 'text-white' : 'text-black']">
    <div class="bg seller-bg" :style="{ backgroundImage: `url('${image}')` }"></div>
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
        :aria-hidden="step < 2"
        class="text-4xl mb-4 fade-slide"
        keypath="components.wrapped.organs.sellerRank"
        scope="global"
        tag="h1"
      >
        <template #rank>
          <span class="font-bold">
            {{ t('components.wrapped.organs.rank', { rank: organ.ordinalTurnoverCreated + 1 }) }}
          </span>
        </template>
      </i18n-t>
      <i18n-t
        :aria-hidden="step < 3"
        class="text-xl fade-slide"
        keypath="components.wrapped.organs.transactionRank"
        scope="global"
        tag="h3"
      >
        <template #rank>
          <span class="font-bold">
            {{ t('components.wrapped.organs.rank', { rank: organ.ordinalTransactionCreated + 1 }) }}
          </span>
        </template>
      </i18n-t>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { WrappedOrganMemberResponse } from '@gewis/sudosos-client';
import { useCardReveal } from '@/composables/wrappedCard';
import { organName } from '@/utils/wrappedUtils';

const props = defineProps<{
  active?: boolean;
  organ: WrappedOrganMemberResponse;
  image: string;
  dark: boolean;
}>();

const { t } = useI18n();

const { step } = useCardReveal(() => props.active, [500, 1500, 800]);
</script>

<style scoped lang="scss">
.seller-bg {
  background-size: 90%;
  opacity: 0.3;
  transform: rotate(-8deg);
}
</style>
