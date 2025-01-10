// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      meta: [
        { name: "darkreader-lock", content: "" },
      ]
    },
  },
  modules: [
    "@nuxt/content",
    "nuxt-jsonld",
    "nuxt-lucide-icons",
    "@nuxtjs/sitemap",
  ],
  content: {
    documentDriven: true,
  },
  compatibilityDate: '2024-11-01',
  nitro: {
    plugins: ['~/server/plugins/reading-time.ts'],
  },
  css: ['~/lib/main.css'],
  devtools: { enabled: true },
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
});