import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      // 1. BEHEBT DIE "OUTDATED JSX" WARNUNG
      // Erzwingt die Nutzung des neuen JSX-Transforms (React 17+)
      jsxRuntime: 'automatic', 
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'GlanzOps Enterprise',
        short_name: 'GlanzOps',
        description: 'Einsatzplanung & ERP für Gebäudereinigung',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // 2. OPTIONAL: Saubere Imports mit '@'
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 3. SICHERHEIT: Port festlegen (für CORS im Backend wichtig)
  server: {
    port: 5173,
    strictPort: true, // Bricht ab, falls 5173 belegt ist, statt Port zu wechseln
  }
});