import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Enables 'describe', 'test', 'expect' without explicit imports
    environment: 'jsdom', // Simulates a browser environment for React testing
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
