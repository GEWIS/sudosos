import { createI18n } from 'vue-i18n';
import { setLocale } from 'yup';
import admin_en from '../locales/en/modules/admin.json';
import common_en from '../locales/en/common/common.json';
import mutations_en from '../locales/en/components/mutations.json';
import auth_en from '../locales/en/modules/auth.json';
import user_en from '../locales/en/modules/user.json';
import seller_en from '../locales/en/modules/seller.json';
import financial_en from '../locales/en/modules/financial.json';
import footer_en from '../locales/en/components/footer.json';
import general_en from '../locales/en/components/general.json';

import admin_nl from '../locales/nl/modules/admin.json';
import common_nl from '../locales/nl/common/common.json';
import mutations_nl from '../locales/nl/components/mutations.json';
import auth_nl from '../locales/nl/modules/auth.json';
import user_nl from '../locales/nl/modules/user.json';
import seller_nl from '../locales/nl/modules/seller.json';
import financial_nl from '../locales/nl/modules/financial.json';
import footer_nl from '../locales/nl/components/footer.json';
import general_nl from '../locales/nl/components/general.json';

import admin_pl from '../locales/pl/modules/admin.json';
import common_pl from '../locales/pl/common/common.json';
import mutations_pl from '../locales/pl/components/mutations.json';
import auth_pl from '../locales/pl/modules/auth.json';
import user_pl from '../locales/pl/modules/user.json';
import seller_pl from '../locales/pl/modules/seller.json';
import financial_pl from '../locales/pl/modules/financial.json';
import footer_pl from '../locales/pl/components/footer.json';
import general_pl from '../locales/pl/components/general.json';

const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'en',
  fallbackLocale: 'en',
  legacy: false,
  globalInjection: true,
  messages: {
    en: {
      ...common_en,
      components: {
        ...general_en.components,
        ...mutations_en.components,
        ...footer_en.components,
      },
      modules: {
        ...auth_en.modules,
        ...user_en.modules,
        ...seller_en.modules,
        ...financial_en.modules,
        ...admin_en.modules,
      },
    },
    nl: {
      ...common_nl,
      components: {
        ...general_nl.components,
        ...mutations_nl.components,
        ...footer_nl.components,
      },
      modules: {
        ...auth_nl.modules,
        ...user_nl.modules,
        ...seller_nl.modules,
        ...financial_nl.modules,
        ...admin_nl.modules,
      },
    },
    pl: {
      ...common_pl,
      components: {
        ...general_pl.components,
        ...mutations_pl.components,
        ...footer_pl.components,
      },
      modules: {
        ...auth_pl.modules,
        ...user_pl.modules,
        ...seller_pl.modules,
        ...financial_pl.modules,
        ...admin_pl.modules,
      },
    },
  },
});

setLocale({
  mixed: {
    required: ({ path }) =>
      i18n.global.t('common.validation.required', {
        path: i18n.global.t(`common.validation.fieldNames.${path}`),
      }),
  },
  string: {
    min: ({ path, min }) =>
      i18n.global.t('common.validation.string.min', {
        path: i18n.global.t(`common.validation.fieldNames.${path}`),
        min,
      }),
    max: ({ path, max }) =>
      i18n.global.t('common.validation.string.max', {
        path: i18n.global.t(`common.validation.fieldNames.${path}`),
        max,
      }),
  },
  number: {
    min: ({ path, min }) =>
      i18n.global.t('common.validation.number.min', {
        path: i18n.global.t(`common.validation.fieldNames.${path}`),
        min,
      }),
  },
});

export default i18n;
