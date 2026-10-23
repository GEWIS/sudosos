import { defineConfig } from 'eslint/config';
import { eslintConfig as common } from '@gewis/eslint-config-typescript';
import { eslintConfig as vue } from '@gewis/eslint-config-vue';
import { eslintConfig as prettier } from '@gewis/prettier-config';

export default defineConfig([
  {
    extends: [common, vue, prettier],
  },
  // OpenVue components are registered globally in src/main.ts; don't import them locally.
  {
    files: ['src/**/*.vue'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[importKind!='type'][source.value=/^openvue\\u002F/] > ImportDefaultSpecifier",
          message: 'OpenVue components are registered globally in src/main.ts. Use them without importing.',
        },
      ],
    },
  },
]);
