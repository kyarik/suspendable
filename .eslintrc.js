module.exports = {
  env: {
    browser: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'jest', 'testing-library'],
  extends: [
    'eslint:all',
    'plugin:node/recommended',
    'plugin:compat/recommended',
    'plugin:react/all',
    'plugin:react-hooks/recommended',
    'plugin:@typescript-eslint/all',
    'prettier',
  ],
  overrides: [
    {
      files: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
      extends: ['plugin:jest/all', 'plugin:testing-library/react'],
      rules: {
        'jest/lowercase-name': [
          'error',
          {
            ignore: ['describe'],
          },
        ],
        'jest/no-hooks': 'off',
        'jest/prefer-expect-assertions': 'off',
        'jest/require-top-level-describe': 'off',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 2021,
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/init-declarations': 'off',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
      },
      {
        selector: 'parameter',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        leadingUnderscore: 'allowSingleOrDouble',
        trailingUnderscore: 'allowSingleOrDouble',
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: 'enumMember',
        format: ['PascalCase'],
      },
    ],
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/non-nullable-type-assertion-style': 'off',
    '@typescript-eslint/no-type-alias': [
      'error',
      { allowAliases: 'always', allowCallbacks: 'always' },
    ],
    '@typescript-eslint/no-use-before-define': ['error', { variables: false }],
    '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    '@typescript-eslint/promise-function-async': 'off',
    'camelcase': 'off',
    'func-style': 'off',
    'max-lines-per-function': 'off',
    'max-lines': 'off',
    'max-statements': 'off',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-param-reassign': ['error', { props: true }],
    'no-plusplus': 'off',
    'no-ternary': 'off',
    'no-underscore-dangle': ['error', { allow: ['__DEV__'] }],
    'node/no-missing-import': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'one-var': 'off',
    'react/function-component-definition': [
      'error',
      {
        namedComponents: 'arrow-function',
        unnamedComponents: 'arrow-function',
      },
    ],
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'react/jsx-no-literals': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/no-multi-comp': ['error', { ignoreStateless: true }],
    'react/require-optimization': 'off',
    'react/sort-comp': 'off',
    'sort-imports': 'off',
    'sort-keys': 'off',
  },
  settings: {
    polyfills: ['Promise'],
  },
  ignorePatterns: [
    '/coverage',
    '/dist',
    '/integration-tests/**/*.js',
    '/integration-tests/typescript/index.ts',
    '/node_modules',
  ],
};
