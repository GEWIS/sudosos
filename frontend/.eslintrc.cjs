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
    'plugin:@intlify/vue-i18n/recommended'
  ],

  ignorePatterns: ["/src/components/icons/*.vue"],
  rules: {
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
    "vue-i18n": {
      "localeDir": "/src/locales",
    }
  }
};
