module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
  ],
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  ignorePatterns: [
    'dist/',
    'node_modules/',
    '*.astro', // Skip Astro files for now due to parser issues
    'src/test/', // Skip test files with vitest globals
    'src/types/', // Skip type definition files with unused vars
  ],
  rules: {
    'prefer-const': 'error',
    'no-var': 'error',
    'no-console': 'warn',
    'eqeqeq': 'error',
    'no-unused-vars': 'off', // Allow unused vars in type definitions
  },
};