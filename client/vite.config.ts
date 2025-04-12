import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import type { UserConfig as VitestConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@guitar-app/shared': path.resolve(__dirname, '../shared/src'),
      src: "/src",
      components: "/src/components",
      store: "/src/store",
      patterns: "/src/patterns",
      types: "/src/types",
      themes: "/src/themes",
      utils: "/src/utils",
      hooks: "/src/hooks"
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.index.ts', '.index.tsx']
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    }
  },
  define: {
    'process.env': process.env
  }
} as VitestConfig); 