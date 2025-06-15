
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon.png",
        "assets/favicon_io/*",
      ],
      manifest: {
        name: "Ghatak Sports Academy",
        short_name: "GSAI",
        description: "Train at Ghatak Sports Academy, India's leading martial arts and self-defense school. Learn karate, taekwondo, fitness, and more with professional coaches.",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#fbff00",
        orientation: "portrait-primary",
        lang: "en",
        scope: "/",
        prefer_related_applications: false,
        icons: [
          {
            src: "/assets/favicon_io/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/assets/favicon_io/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/assets/favicon_io/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
          },
          {
            src: "/assets/favicon_io/favicon-32x32.png",
            sizes: "32x32",
            type: "image/png"
          },
          {
            src: "/assets/favicon_io/favicon-16x16.png",
            sizes: "16x16",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2}"],
        globIgnores: ['**/node_modules/**/*'],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document" || request.destination === "script" || request.destination === "style",
            handler: "NetworkFirst",
            options: {
              cacheName: "app-shell",
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /^https:\/\/ghatakgsai\.netlify\.app\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "site-data",
              expiration: { maxEntries: 30, maxAgeSeconds: 86400 },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico|gif)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 },
            },
          },
          {
            urlPattern: /\.(?:woff2|woff)$/i,
            handler: "CacheFirst",
            options: {
              cacheName: "fonts",
              expiration: { maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 },
            },
          },
        ],
        navigateFallback: "/offline.html",
      },
      devOptions: {
        enabled: true,
      },
      injectRegister: "auto",
      includeManifestIcons: false,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
