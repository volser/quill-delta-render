import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    exclude: ['src/**/*.browser.test.ts', '**/node_modules/**'],
    benchmark: {
      include: ['src/**/*.bench.ts'],
      exclude: ['src/**/*.browser.bench.ts'],
    },
  },
});
