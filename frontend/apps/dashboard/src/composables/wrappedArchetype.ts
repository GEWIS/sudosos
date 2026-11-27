import { computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type { WrappedResponse } from '@gewis/sudosos-client';
import { activeDays } from '@/utils/wrappedUtils';

const MONSTER_PRODUCT_ID = 295;
// About one a week during the academic year.
const MONSTER_SJAARS_COUNT = 50;

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
    const { transactions, organs, itemCount, alcoholicItemCount, distinctProducts, topProducts } = wrapped();
    const { transactionCount, transactionHeatmap, daytimeTransactionCount } = transactions;

    const percentage = (part: number, total: number) =>
      (part / total).toLocaleString(locale.value, { style: 'percent', maximumFractionDigits: 0 });

    const rungUp = organs.reduce((sum, organ) => sum + organ.transactionsCreated, 0);
    const days = activeDays(transactionHeatmap);
    // The response only holds the five most bought products, so Monster counts when it is one of them.
    const monsters = topProducts.find((product) => product.id === MONSTER_PRODUCT_ID)?.count ?? 0;

    const archetypes: (Archetype & { fits: boolean })[] = [
      {
        fits: monsters >= MONSTER_SJAARS_COUNT,
        title: t('components.wrapped.archetype.monsterSjaars.title'),
        description: t('components.wrapped.archetype.monsterSjaars.description', {
          count: monsters.toLocaleString(locale.value),
        }),
      },
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
        fits: daytimeTransactionCount >= 0.6 * transactionCount,
        title: t('components.wrapped.archetype.daytimer.title'),
        description: t('components.wrapped.archetype.daytimer.description', {
          share: percentage(daytimeTransactionCount, transactionCount),
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
