import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiPort = env.PORT ?? '3001'
  const devPort = parseInt(env.DEV_PORT ?? '5173', 10)

  return {
    plugins: [react()],
    server: {
      port: devPort,
      proxy: {
        '/api': `http://localhost:${apiPort}`,
      },
    },
  }
})
