<template>
  <div class="align-content-center flex flex-col">
    <div class="font-bold py-4 text-center text-xl">
      {{ t('common.wrapped.lastYear') }}
    </div>
    <div class="text-center">{{ t('common.wrapped.total') }}</div>
    <div class="text-3xl text-center">
      <div>{{ formatPrice(total!) }}</div>
    </div>

    <div class="text-center">{{ t('common.wrapped.totalBorrel') }}</div>
    <div class="text-3xl text-center">
      <div>{{ formatPrice(totalBorrels!) }}</div>
    </div>
    <div class="font-bold py-4 text-center text-xl">
      {{ t('common.wrapped.depth') }}
    </div>
    <div class="text-center">{{ t('common.wrapped.totalAlc') }}</div>
    <div class="text-3xl text-center">
      <div>{{ formatPrice(totalAlc!) }}</div>
    </div>

    <div class="text-center">{{ t('common.wrapped.totalSoda') }}</div>
    <div class="text-3xl text-center">
      <div>{{ formatPrice(totalSoda!) }}</div>
    </div>

    <div class="text-center">{{ t('common.wrapped.totalSnacks') }}</div>
    <div class="text-3xl text-center">
      <div>{{ formatPrice(totalSnacks!) }}</div>
    </div>

    <div class="font-bold py-4 text-center text-xl">
      {{ t('common.wrapped.fav') }}
    </div>

    <div class="items-center flex flex-col">
      <div v-for="p in topProducts" :key="p.product.id" class="w-7">
        {{ p.count + 'x' }} {{ p.product.name + ' - ' }} {{ formatPrice(p.totalInclVat) }}
      </div>
    </div>

    <div class="font-bold py-4 text-center text-xl">
      {{ t('common.wrapped.christmas') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import type { ReportProductEntryResponse, ReportResponse } from '@sudosos/sudosos-client';
// eslint-disable-next-line import/no-named-as-default
import Dinero from 'dinero.js';
import { useI18n } from 'vue-i18n';
import { formatPrice } from '@/utils/formatterUtils';
import apiService from '@/services/ApiService';

const { t } = useI18n();

const report = ref<ReportResponse>();

const total = computed(() => {
  return report.value?.totalInclVat || { amount: 0, currency: 'EUR', precision: 2 };
});

const totalBorrels = computed(() => {
  if (report.value == undefined) {
    return { amount: 0, currency: 'EUR', precision: 2 };
  }

  // Remove bac verkoop
  return Dinero(report.value.totalInclVat as Dinero.Options)
    .subtract(Dinero(report.value.data.pos!.find((p) => p.pos.id == 1)!.totalInclVat as Dinero.Options))
    .toObject();
});

const totalAlc = computed(() => {
  if (report.value == undefined) {
    return { amount: 0, currency: 'EUR', precision: 2 };
  }

  return (
    report.value.data.categories!.find((p) => p.category.id == 1)?.totalInclVat || {
      amount: 0,
      currency: 'EUR',
      precision: 2,
    }
  );
});

const totalSoda = computed(() => {
  if (report.value == undefined) {
    return { amount: 0, currency: 'EUR', precision: 2 };
  }

  return (
    report.value.data.categories!.find((p) => p.category.id == 2)?.totalInclVat || {
      amount: 0,
      currency: 'EUR',
      precision: 2,
    }
  );
});

const totalSnacks = computed(() => {
  if (report.value == undefined) {
    return { amount: 0, currency: 'EUR', precision: 2 };
  }

  return (
    report.value.data.categories!.find((p) => p.category.id == 3)?.totalInclVat || {
      amount: 0,
      currency: 'EUR',
      precision: 2,
    }
  );
});

const topProducts = computed(() => {
  if (report.value == undefined) {
    return [];
  }

  const allProducts: ReportProductEntryResponse[] = [];

  for (const product of report.value.data.products!) {
    const idx = allProducts.findIndex((p) => p.product.id == product.product.id);
    if (idx >= 0) {
      allProducts[idx].totalInclVat = Dinero(allProducts[idx].totalInclVat as Dinero.Options)
        .add(Dinero(product.totalInclVat as Dinero.Options))
        .toObject();
      allProducts[idx].count += product.count;
    } else {
      allProducts.push(product);
    }
  }

  return allProducts.sort((a, b) => b.count - a.count).slice(0, 10);
});

onBeforeMount(async () => {
  const authStore = useAuthStore();

  report.value = (
    await apiService.user.getUsersPurchasesReport(authStore.getUser!.id, '2024-01-01', '2024-12-31')
  ).data;
});
</script>

<style></style>
