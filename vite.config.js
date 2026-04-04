import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/Voedingsdagboek/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Voedingsdagboek',
        short_name: 'Dagboek',
        description: 'Houd bij wat je eet en hoe je je voelt',
        theme_color: '#10b981',
        background_color: '#f9fafb',
        display: 'standalone',
        scope: '/Voedingsdagboek/',
        start_url: '/Voedingsdagboek/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/Voedingsdagboek/index.html',
        navigateFallbackAllowlist: [/^\/Voedingsdagboek\//]
      }
    })
  ],
})
