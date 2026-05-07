import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// On GitHub Pages the app is served from /<repo-name>/.
// Locally (`npm run dev`) we want it at /, so only set the base when building.
export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  server: { host: true },
  base: command === 'build' ? '/kramp-tco/' : '/',
}))
