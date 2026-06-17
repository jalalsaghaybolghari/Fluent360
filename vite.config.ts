import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["/icons/icon-192.png", "/icons/icon-512.png"],
      manifest: {
        name: "Fluent360 Vocab",
        short_name: "Fluent360",
        description: "Vocabulary cards with offline audio and autoplay player",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "image" ||
              request.destination === "audio" ||
              request.url.includes("/audio/"),
            handler: "CacheFirst",
            options: {
              cacheName: "media-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "style" || request.destination === "script",
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets-cache"
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: "dist"
  }
});
