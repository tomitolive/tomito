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
      '/api/cpa': {
        target: 'https://www.cpagrip.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/cpa/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            proxyReq.setHeader('Origin', 'https://www.cpagrip.com');
            proxyReq.setHeader('Referer', 'https://www.cpagrip.com');
          });
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
        }
      }
    }
  },
  base: '/', // Custom domain tomito.xyz
})