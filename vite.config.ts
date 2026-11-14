/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/times-of-day/',
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    testTimeout: 15000,
    pool: 'threads',
    maxWorkers: 2,
    fileParallelism: false,
  },
})
