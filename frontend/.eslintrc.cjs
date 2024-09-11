/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

const path = require('path');

module.exports = {
    root: true,
    plugins: ['import'],
    extends: [
        'plugin:vue/vue3-essential',
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting',
        'plugin:@intlify/vue-i18n/recommended'
    ],
    rules: {
        'max-len': ['warn', { "code": 120 }],
        'semi': ['error', 'always'],
        'object-curly-spacing': ['error', 'always'],
        'vue/component-api-style': ['error', ['script-setup', 'composition']],
        'vue/block-lang': ['error', { 'script': { 'lang': 'ts' } }],
        "vue/mustache-interpolation-spacing": ["error", "always"],
        '@intlify/vue-i18n/no-raw-text': 'error',
        '@intlify/vue-i18n/no-missing-keys': 'error',
        '@intlify/vue-i18n/no-missing-keys-in-other-locales': ['error'],
        '@intlify/vue-i18n/no-unused-keys': ['warn', { 'enableFix': false, 'extensions': ['.js', '.vue', '.ts'] }],
        '@intlify/vue-i18n/no-duplicate-keys-in-locale': 'error'
    },
    ignorePatterns: ["/src/components/icons/*.vue", "package-lock.json"],
    parserOptions: {
        ecmaVersion: 'latest'
    },
    settings: {
        'vue-i18n': {
            localeDir: [
                // English locale configuration
                {
                    pattern: './src/locales/en/**/*.json', // Match JSON files in the English 'modules' folder
                    localePattern: "^.*\\\\(?<locale>en)\\\\.*\\.json$", // Regex to capture 'en' in the path
                    localeKey: 'path'
                },
                {
                    pattern: './src/locales/nl/**/*.json', // Match JSON files in the English 'modules' folder
                    localePattern: "^.*\\\\(?<locale>nl)\\\\.*\\.json$", // Regex to capture 'en' in the path
                    localeKey: 'path'
                },
            ],
            messageSyntaxVersion: '^9.2.2'
        }
    },
    overrides: [
        {
            files: ['src/locales/**/*.json'],
            rules: {
                'max-len': 'off'
            }
        }
    ]
};
