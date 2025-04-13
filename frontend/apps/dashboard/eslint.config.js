import { defineConfig } from 'eslint/config';
import vueI18n from '@intlify/eslint-plugin-vue-i18n';
import vueParser from 'vue-eslint-parser';
import * as typescriptParser from '@typescript-eslint/parser';
import { eslintConfig as common } from '@gewis/eslint-config-typescript';
import { eslintConfig as vue } from '@gewis/eslint-config-vue';
import { eslintConfig as prettier } from '@gewis/prettier-config';

export default defineConfig([
  {
    extends: [common, vue, prettier],
    rules: {
      '@typescript-eslint/no-unused-expressions': ['off', { extensions: ['.json'] }],
    },
  },
  // linting for i18n
  {
    extends: [...vueI18n.configs.recommended],
    rules: {
      '@intlify/vue-i18n/no-missing-keys-in-other-locales': ['error'],
      '@intlify/vue-i18n/no-unused-keys': ['warn', { enableFix: false, extensions: ['.js', '.vue', '.ts'] }],
      '@intlify/vue-i18n/no-duplicate-keys-in-locale': 'error',
    },
    ignores: ['/src/components/icons/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: typescriptParser,
      },
    },
    settings: {
      'vue-i18n': {
        localeDir: [
          // English locale configuration
          {
            pattern: './src/locales/en/**/*.json', // Match JSON files in the English 'modules' folder
            localePattern: '^.*\\\\(?<locale>en)\\\\.*\\.json$', // Regex to capture 'en' in the path
            localeKey: 'path',
          },
          {
            pattern: './src/locales/nl/**/*.json', // Match JSON files in the English 'modules' folder
            localePattern: '^.*\\\\(?<locale>nl)\\\\.*\\.json$', // Regex to capture 'en' in the path
            localeKey: 'path',
          },
        ],
        messageSyntaxVersion: '^9.2.2',
      },
    },
  },
]);
