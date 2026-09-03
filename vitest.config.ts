import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './',
    include: ['tests/**/*.spec.ts'],
    globals: true,
    pool: 'forks',
    testTimeout: 30000,
  },
});
