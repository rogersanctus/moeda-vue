import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      '@t': path.resolve(process.cwd(), './types')
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
