import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  const envWithProcessPrefix = Object.entries(env).reduce(
    (prev, [key, val]) => {
      return {
        ...prev,
        ['process.env.' + key]: '"' + val + '"'
      }
    },
    {}
  )
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': new URL('./src/', import.meta.url).pathname,
        '@t': new URL('./types/', import.meta.url).pathname
      }
    },
    build: {
      sourcemap: mode === 'development'
    },
    server: {
      fs: {
        allow: ['./src', './types', './node_modules']
      }
    },
    define: envWithProcessPrefix
  }
})
