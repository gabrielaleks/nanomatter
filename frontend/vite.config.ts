import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr"

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
      tailwindcss(),
      svgr()
    ],
    server: {
      host: '0.0.0.0',
      port: 5173,
      watch: {
        usePolling: true,
        interval: 100
      },
      proxy: {
        '/api': {
          changeOrigin: true,
          target: env.DEV_API_URL,
        }
      }
    }
  }
})