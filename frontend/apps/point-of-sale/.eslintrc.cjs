/* eslint-env node */
module.exports = {
    'extends': [
        '../../.eslintrc.cjs',
    ],
    overrides: [
        {
            files: ['*.vue'],
            rules: {
                '@intlify/vue-i18n/no-raw-text': 'off',
            }
        }
    ]
};
