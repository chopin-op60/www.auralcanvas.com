import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8083,
    allowedHosts: [
      'localhost',
      '8.221.96.70', 
      'www.auralcanvas.fun',
      'auralcanvas.fun',
      '.auralcanvas.fun'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue'],
          'vue-router': ['vue-router'],
          'pinia': ['pinia'], 
          'element-plus': ['element-plus'],
          'element-icons': ['@element-plus/icons-vue'],
          'utils': ['axios', 'js-cookie', 'dayjs']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
