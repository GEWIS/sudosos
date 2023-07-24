/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  plugins: ['import'],
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  rules: {
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
    ]
  },
  parserOptions: {
    ecmaVersion: 'latest',
  }
}
