import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: './', // Ensures assets load correctly on GitHub Pages subpaths
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: true, // Listen on all local IPs so mobile devices can access via Wi-Fi
    port: 5173,
  },
})


