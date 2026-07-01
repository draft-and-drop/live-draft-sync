import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ]
  },
  runtimeConfig: {
    fantasyProsApiKey: "",
  },
  typescript: {
    typeCheck: true,
    strict: true,
  },
  routeRules: {
    "/api/**": {
      swr: 60 * 15, // cache API responses on server for 15 minutes
    },
  },
});
