import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: true },
  modules: [
    'nuxt-monaco-editor',
    "@nuxtjs/tailwindcss",
  ],
  experimental: {
    payloadExtraction: false,
  },
  runtimeConfig: {
    public: {
      remoteURL: process.env.REMOTE_URL ?? "http://localhost:3000"
    }
  }
})
