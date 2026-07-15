import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api/appsave': {
        target: 'https://appsave.online',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/appsave/, '/api/v2'),
        configure: (proxy) => {
          proxy.on('error', (err) => {
            console.log('AppSave proxy error:', err);
          });
        }
      }
    }
  },
  base: '/', // Custom domain tomito.xyz
})