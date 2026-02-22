const js = require('@eslint/js');
const globals = require('globals');
const prettier = require('eslint-config-prettier');

/**
 * ESLint Flat Config (ESLint v9)
 * - CommonJS project (Axion template)
 * - Keeps rules reasonable so the existing template doesn’t explode with noise
 */
module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/cache/**',
      '**/.git/**',
      '**/dist/**',
      '**/coverage/**',
      '**/__MACOSX/**'
    ]
  },
  js.configs.recommended,
  prettier,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      // Keep the codebase consistent without being overly strict.
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error'
    }
  }
];
