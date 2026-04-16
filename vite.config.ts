import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Vitest cannot use Next's `server-only` (it throws outside RSC); stub as empty module. */
function serverOnlyStub(): Plugin {
  const virtual = '\0virtual:server-only';
  return {
    name: 'server-only-stub',
    resolveId(id) {
      if (id === 'server-only') return virtual;
    },
    load(id) {
      if (id === virtual) return 'export {};';
    },
  };
}

export default defineConfig({
  plugins: [react(), serverOnlyStub()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      exclude: ['node_modules/', 'src/__tests__/', '*.config.*', '.next/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
