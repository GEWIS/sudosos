/* eslint-env node */
module.exports = {
  'extends': [
    '../../.eslintrc.cjs',
  ],
  'overrides': [
    {
      'files': ['src/locales/*.json'],
      'rules': {
        'max-len': 'off',
      },
    },
    {
      'files': ['main.ts'],
      'rules': {
        '@typescript-eslint/no-unused-vars': 'off',
        'vue/multi-word-component-names': 'off',
        'vue/no-reserved-component-names': 'off',
      },
    }
    ],
};
