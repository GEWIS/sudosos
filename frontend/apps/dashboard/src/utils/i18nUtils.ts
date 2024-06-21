import { createI18n } from "vue-i18n";
import en from "../locales/en.json";
import nl from "../locales/nl.json";
import { setLocale } from "yup";

const i18n = createI18n({
    locale: localStorage.getItem('locale') || 'en',
    fallbackLocale: 'en',
    legacy: false,
    globalInjection: true,
    messages: {
        en,
        nl
    },
});

setLocale({
    mixed: {
        required: ({ path }) => i18n.global.t('validation.required',
          { path: i18n.global.t(`validation.fieldNames.${path}`) }),
    },
    string: {
        min: ({ path, min }) => i18n.global.t('validation.string.min',
          { path: i18n.global.t(`validation.fieldNames.${path}`), min }),
        max: ({ path, max }) => i18n.global.t('validation.string.max',
          { path: i18n.global.t(`validation.fieldNames.${path}`), max }),
    },
    number: {
        min: ({ path, min }) => i18n.global.t('validation.number.min',
          { path: i18n.global.t(`validation.fieldNames.${path}`), min }),
    },
});

export default i18n;


