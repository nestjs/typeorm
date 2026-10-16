import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    root: './',
    include: ['tests/**/*.spec.ts'],
    globals: true,
    pool: 'forks',
    testTimeout: 30000,
    typecheck: {
      enabled: true,
      include: ['tests/**/*.spec-d.ts'],
      tsconfig: './tsconfig.spec.json',
    },
  },
});
