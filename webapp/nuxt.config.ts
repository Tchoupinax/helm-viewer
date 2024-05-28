import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  modules: [
    'nuxt-monaco-editor',
    "@nuxtjs/tailwindcss",
    "nuxt3-notifications",
    "nuxt-shiki",
  ],
  experimental: {
    payloadExtraction: false,
  },
  runtimeConfig: {
    public: {
      remoteURL: process.env.BACKEND_ENDPOINT ?? process.env.REMOTE_URL ?? "http://localhost:3000"
    }
  }
})