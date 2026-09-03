import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: {
    correctness: 'warn',
  },
  rules: {
    'no-unused-vars': 'warn',
  },
  ignorePatterns: ['dist/**', 'node_modules/**', 'tests/**'],
});
