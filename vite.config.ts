import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-day-picker') || id.includes('date-fns')) return 'vendor-calendar'
            if (id.includes('recharts')) return 'vendor-charts'
            if (id.includes('@radix-ui')) return 'vendor-radix'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('effector')) return 'vendor-effector'
            if (id.includes('axios')) return 'vendor-axios'
            return 'vendor'
          }
        },
      },
    },
  },
})
