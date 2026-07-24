import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'
import path from 'path'
import { fileURLToPath } from 'url'
import mkcert from 'vite-plugin-mkcert'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')
  const toriiUrl = env.VITE_TORII_URL || 'http://localhost:8080'

  return {
    plugins: [wasm(), mkcert(), topLevelAwait(), react()],
    root: './',               // frontend root
    base: './',               // use relative paths for Vercel
    build: {
      outDir: 'dist',         // output folder
      target: 'esnext',
      rollupOptions: {
        input: path.resolve(__dirname, 'index.html'),  // entry point
      },
    },
    esbuild: {
      target: 'esnext',
    },
    server: {
      proxy: {
        '/torii': {
          target: toriiUrl,
          changeOrigin: true,
          rewrite: (proxyPath) => proxyPath.replace(/^\/torii/, ''),
        },
      },
    },
    resolve: {
      alias: {
        'fdir': 'fdir/dist/index.cjs',
        '@': path.resolve(__dirname, './src') // optional: import like '@/components/ConnectButton'
      }
    }
  }
})
