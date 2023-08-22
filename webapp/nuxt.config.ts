import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  modules: [
    'nuxt-monaco-editor',
    "@nuxtjs/tailwindcss",
  ],
  experimental: {
    payloadExtraction: false,
  }
})
