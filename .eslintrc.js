module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'off',
  },
  env: {
    node: true,
    es6: true,
    jest: true,
  },
  globals: {
    NodeJS: 'readonly',
  },
  ignorePatterns: ['dist/', 'coverage/', 'node_modules/'],
};
