import { computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { activeDays } from '@/utils/wrappedUtils';

export interface Archetype {
  title: string;
  description: string;
}

/**
 * The first description that fits the year of the user, from most to least specific.
 */
export function useWrappedArchetype(wrapped: () => WrappedResponse): ComputedRef<Archetype> {
  const { t, locale } = useI18n();

  return computed(() => {
    const { transactions, organs, itemCount, alcoholicItemCount, distinctProducts } = wrapped();
    const { transactionCount, transactionHeatmap, hourHistogram } = transactions;

    const percentage = (part: number, total: number) =>
      (part / total).toLocaleString(locale.value, { style: 'percent', maximumFractionDigits: 0 });
    const between = (from: number, until: number) =>
      hourHistogram.slice(from, until).reduce((sum, count) => sum + count, 0);

    const rungUp = organs.reduce((sum, organ) => sum + organ.transactionsCreated, 0);
    const days = activeDays(transactionHeatmap);

    const archetypes: (Archetype & { fits: boolean })[] = [
      {
        fits: rungUp > transactionCount,
        title: t('components.wrapped.archetype.bartender.title'),
        description: t('components.wrapped.archetype.bartender.description', {
          count: rungUp.toLocaleString(locale.value),
        }),
      },
      {
        fits: alcoholicItemCount === 0,
        title: t('components.wrapped.archetype.driver.title'),
        description: t('components.wrapped.archetype.driver.description'),
      },
      {
        fits: between(0, 6) >= 0.2 * transactionCount,
        title: t('components.wrapped.archetype.nightOwl.title'),
        description: t('components.wrapped.archetype.nightOwl.description', {
          share: percentage(between(0, 6), transactionCount),
        }),
      },
      {
        fits: distinctProducts >= 15,
        title: t('components.wrapped.archetype.explorer.title'),
        description: t('components.wrapped.archetype.explorer.description', { count: distinctProducts }),
      },
      {
        fits: days >= 100,
        title: t('components.wrapped.archetype.regular.title'),
        description: t('components.wrapped.archetype.regular.description', { days }),
      },
      {
        fits: between(6, 17) >= 0.6 * transactionCount,
        title: t('components.wrapped.archetype.daytimer.title'),
        description: t('components.wrapped.archetype.daytimer.description', {
          share: percentage(between(6, 17), transactionCount),
        }),
      },
      {
        fits: alcoholicItemCount >= 0.75 * itemCount,
        title: t('components.wrapped.archetype.purist.title'),
        description: t('components.wrapped.archetype.purist.description', {
          share: percentage(alcoholicItemCount, itemCount),
        }),
      },
      {
        fits: true,
        title: t('components.wrapped.archetype.allRounder.title'),
        description: t('components.wrapped.archetype.allRounder.description'),
      },
    ];

    return archetypes.find((archetype) => archetype.fits)!;
  });
}
