module.exports = {
    env: {
        node: true,
        browser: true,
    },
    parserOptions: {
        ecmaVersion: 12,
    },
    plugins: ['jsx-a11y'],
    extends: ['plugin:jsx-a11y/strict', 'prettier'],
    settings: {
        react: {
            version: '18.2.0',
        },
    },
    ignorePatterns: ['lib/**'],
    rules: {},
    overrides: [
        {
            files: ['**/*.ts'],
            plugins: ['@typescript-eslint'],
            extends: ['./.eslintrc-overrides.js', 'plugin:jsx-a11y/strict', 'prettier'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                project: ['./tsconfig.json'],
            },
        },
    ],
};
