import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Enables 'describe', 'test', 'expect' without explicit imports
    globals: true,
    // Simulates a browser environment for React testing
    environment: 'jsdom',
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    exclude: ['**/node_modules/**', '**/e2e/**', '**/*.e2e.spec.ts'],
  },
});
