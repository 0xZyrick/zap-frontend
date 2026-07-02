import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: './',               // frontend root
  base: './',               // use relative paths for Vercel
  build: {
    outDir: 'dist',         // output folder
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),  // entry point
    },
  },
  resolve: {
    alias: {
      'fdir': 'fdir/dist/index.cjs',
      '@': path.resolve(__dirname, './src') // optional: import like '@/components/ConnectButton'
    }
  }
})
