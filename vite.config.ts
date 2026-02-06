import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/", // استخدام "/" لـ Domain مخصص أو User Page، أو اسم الـ Repo إذا كان Project Page
  server: {
    port: 8080,
    host: true,
  },
  plugins: [react()],
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
