import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/photo-frame-web/',
  plugins: [tailwindcss()],
})