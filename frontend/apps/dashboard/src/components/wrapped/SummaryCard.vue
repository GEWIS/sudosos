<template>
  <div class="card-root text-white" :class="{ active }">
    <div class="content w-full">
      <h2 class="text-xl">{{ summary.title }}</h2>
      <h1 class="text-4xl font-black pb-4">{{ summary.tagline }}</h1>

      <dl class="grid gap-3">
        <div
          v-for="(line, index) in summary.lines"
          :key="line.label"
          :aria-hidden="step <= index"
          class="rounded-lg bg-white/20 px-3 py-2 fade-slide"
        >
          <dt class="text-sm opacity-80">{{ line.label }}</dt>
          <dd class="text-2xl font-bold m-0">{{ line.value }}</dd>
        </div>
      </dl>

      <div :aria-hidden="step <= summary.lines.length" class="pt-6 flex justify-center fade-slide">
        <Button
          icon="pi pi-share-alt"
          :label="t('components.wrapped.summary.share')"
          :loading="sharing"
          severity="contrast"
          @click="share"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'openvue/usetoast';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { useWrappedArchetype } from '@/composables/wrappedArchetype';
import { useCardReveal } from '@/composables/wrappedCard';
import { formatDineroObject } from '@/utils/formatterUtils';
import { renderSummary, shareFile, type Summary } from '@/utils/wrappedShare';
import { activeDays, transactionsPerWeekday, weekdayName } from '@/utils/wrappedUtils';

const props = defineProps<{ active?: boolean; wrapped: WrappedResponse; firstName?: string }>();

const { t, locale } = useI18n();
const toast = useToast();

const archetype = useWrappedArchetype(() => props.wrapped);

const summary = computed<Summary>(() => {
  const { transactions, totalSpent, topProducts } = props.wrapped;
  const weekdays = transactionsPerWeekday(props.wrapped);
  const weekday = weekdayName(weekdays.indexOf(Math.max(...weekdays)), locale.value, 'long');

  return {
    title: t('components.wrapped.welcome.title', { year: props.wrapped.year }),
    name: props.firstName ?? '',
    tagline: archetype.value.title,
    lines: [
      {
        label: t('components.wrapped.summary.transactions'),
        value: transactions.transactionCount.toLocaleString(locale.value),
      },
      { label: t('components.wrapped.summary.spent'), value: formatDineroObject(totalSpent) },
      { label: t('components.wrapped.summary.product'), value: topProducts[0].name },
      {
        label: t('components.wrapped.summary.weekday'),
        value: weekday.charAt(0).toLocaleUpperCase(locale.value) + weekday.slice(1),
      },
      {
        label: t('components.wrapped.summary.days'),
        value: activeDays(transactions.transactionHeatmap).toLocaleString(locale.value),
      },
    ],
  };
});

const sharing = ref(false);

// Safari only opens the share sheet right after a tap, so the image is drawn before the user taps share.
let image: Promise<File> | undefined;

function renderImage(): Promise<File> {
  if (!image) {
    const rendering = renderSummary(summary.value).then(
      (blob) => new File([blob], `sudosos-wrapped-${props.wrapped.year}.jpg`, { type: blob.type }),
    );
    rendering.catch(() => {
      if (image === rendering) image = undefined;
    });
    image = rendering;
  }
  return image;
}

watch(summary, () => {
  image = undefined;
});
watch(
  () => props.active,
  (active) => {
    if (active) void renderImage().catch(() => undefined);
  },
  { immediate: true },
);

async function share() {
  sharing.value = true;
  try {
    await shareFile(await renderImage());
  } catch {
    toast.add({
      severity: 'error',
      summary: t('common.toast.error.error'),
      detail: t('components.wrapped.summary.failed'),
      life: 5000,
    });
  } finally {
    sharing.value = false;
  }
}

const { step } = useCardReveal(() => props.active, [300, 500, 500, 500, 500, 700]);
</script>
