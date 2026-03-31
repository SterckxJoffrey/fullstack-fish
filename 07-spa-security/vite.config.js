import path from 'node:path';

import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  appType: 'spa',
  root: './src',
  base: '/',
  publicDir: '../public',
  build: {
    outDir: '../dist',
  },
  assetsInclude: ['**/*.svg'],
  server: {
    port: 3080,
    open: true,
    historyApiFallback: true,
    
  },
  plugins: [
    tailwindcss(),
    viteMockServe({
      mockPath: 'mock',
      localEnabled: true,
    }),
  ],
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      reportsDirectory: path.resolve(__dirname, './coverage'),
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80
      }
    },
  },
});
