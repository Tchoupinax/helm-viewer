import { defineNuxtConfig } from "nuxt/config";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-08-06",
  ssr: true,
  devtools: { enabled: process.env.NODE_ENV !== "production" },

  modules: [
    "@nuxt/eslint",
    "@nuxtjs/tailwindcss",
    "nuxt-shiki",
    "nuxt3-notifications",
    "nuxt-monaco-editor",
  ],

  experimental: {
    payloadExtraction: false,
  },

  app: {
    head: {
      script: [
        {
          src: "https://www.gstatic.com/charts/loader.js",
          type: "text/javascript",
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      remoteURL:
        process.env.BACKEND_ENDPOINT ??
        process.env.REMOTE_URL ??
        "http://localhost:3000",
    },
  },
});
