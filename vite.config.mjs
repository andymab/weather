import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
  server: { host: true },
  preview: { host: true },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  
  // это переопределяет нормальную загрузку .env
  // define: {
  //   __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  //   'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  // },
});