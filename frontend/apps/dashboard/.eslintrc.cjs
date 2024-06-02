/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
  root: true,
  plugins: ['import'],
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:@intlify/vue-i18n/recommended',
  ],

  ignorePatterns: ["/src/components/icons/*.vue", "package-lock.json"],
  rules: {
    "@intlify/vue-i18n/no-raw-text": 'error',
    "@intlify/vue-i18n/no-missing-keys": 'error',
    "@intlify/vue-i18n/no-missing-keys-in-other-locales": "error",
    "@intlify/vue-i18n/no-unused-keys": [
      'error',
      { 'enableFix': true ,
      "extensions": [".js", ".vue", ".ts"]

      }
    ],
    "@intlify/vue-i18n/no-duplicate-keys-in-locale": 'error',
    'max-len': ['warn', { "code": 120 } ],
    'semi': ['error', 'always'],
    'object-curly-spacing': ['error', 'always'],
    "vue/component-api-style": ["error",
      ["script-setup", "composition"]
    ],
    "vue/block-lang": ["error",
      {
        "script": {
          "lang": "ts"
        }
      }
    ],

  },
  parserOptions: {
    ecmaVersion: 'latest',
  },
  settings: {
    'vue-i18n': {
      localeDir: './src/locales/*.{json,json5,yaml,yml}',
      messageSyntaxVersion: '^9.2.2' // Ensure this version matches your vue-i18n version
    }
  },
  overrides: [
  {
    files: ["src/locales/*.json"],
    rules: {
      'max-len': 'off'  // Turn off max-len rule for locale JSON files
    }
  }
]
};
