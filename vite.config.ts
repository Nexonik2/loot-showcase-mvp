import path from "path"
import os from "os"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

function getWslIp(): string {
  const interfaces = os.networkInterfaces()
  const eth0 = interfaces["eth0"]
  const ipv4 = eth0?.find((addr) => addr.family === "IPv4" && !addr.internal)
  return ipv4?.address ?? "0.0.0.0"
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: getWslIp(),
    port: 5173,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})