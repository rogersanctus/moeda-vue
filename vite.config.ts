import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': new URL('./src/', import.meta.url).pathname,
      '@t': new URL('./types/', import.meta.url).pathname
    }
  },
  build: {
    sourcemap: true
  },
  server: {
    fs: {
      allow: ['./src', './types', './node_modules']
    }
  }
})
