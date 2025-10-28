// vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const hmrHost = process.env.VITE_HMR_HOST?.trim()

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "figma:asset/2c1ec6a90a7fc9cfca4f45b98c3e9ac1918a1565.png":
        path.resolve(__dirname, "./src/assets/2c1ec6a90a7fc9cfca4f45b98c3e9ac1918a1565.png"),
    },
  },
  build: {
    target: "esnext",
    outDir: "build",
  },
  server: {
    host: true,
    port: 3000,
    open: true,
    hmr: hmrHost ? { protocol: "wss", host: hmrHost, clientPort: 443 } : true,
  },
  preview: { port: 3000 },
})
