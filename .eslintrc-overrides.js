module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    env: {
        browser: true,
        node: true,
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:@typescript-eslint/eslint-recommended'],
    rules: {
        'eol-last': ['error', 'always'],
        'max-len': ['error', { code: 150 }],
        'no-multiple-empty-lines': 'error',
        'no-duplicate-case': 'error',
        'no-var': 'error',
        'sort-keys': 'off',
        'no-extra-boolean-cast': 'off', // so we can use the !! approaches
        'space-before-blocks': 'error',
        'keyword-spacing': ['error', { before: true, after: true }],
        'sort-imports': 'off',
        'prefer-object-spread': 'error',
        quotes: [
            'error',
            'single',
            {
                avoidEscape: true,
            },
        ],
        radix: ['error', 'always'],
        'default-case': ['error'],
        'comma-dangle': ['error', 'always-multiline'],
        'no-unused-expressions': 'off', // disable the base rule as it can report incorrect errors
        // Note: you must disable the base rule as it can report incorrect errors
        // https://typescript-eslint.io/rules/no-unused-vars
        'no-unused-vars': 'off',

        '@typescript-eslint/semi': ['error'],
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off', // allows us to use the "!" symbols
        '@typescript-eslint/array-type': [
            2,
            {
                default: 'array',
            },
        ],
        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/no-unused-expressions': [
            'error',
            {
                allowShortCircuit: true,
                allowTernary: true,
            },
        ],
        '@typescript-eslint/naming-convention': [
            'error',
            {
                selector: 'interface',
                format: ['PascalCase'],
                custom: {
                    regex: '^I[A-Z]',
                    match: true,
                },
            },
        ],
        '@typescript-eslint/no-duplicate-imports': 'error',
        '@typescript-eslint/typedef': [
            'warn',
            {
                memberVariableDeclaration: true,
                arrowParameter: true,
                parameter: true,
                propertyDeclaration: true,
                variableDeclaration: true,
                variableDeclarationIgnoreFunction: true,
            },
        ],
        '@typescript-eslint/explicit-function-return-type': ['error'],
        '@typescript-eslint/explicit-module-boundary-types': ['error'],
        '@typescript-eslint/no-empty-interface': [
            'error',
            {
                allowSingleExtends: true, // will silence warnings about extending a single interface without adding additional members
            },
        ],
        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                argsIgnorePattern: '(^reject$|^_+$)',
                ignoreRestSiblings: true,
                args: 'none',
            },
        ],
        '@typescript-eslint/no-empty-function': [
            'error',
            {
                allow: ['private-constructors'],
            },
        ],
    },
};
