import { defineNuxtConfig } from 'nuxt/config'
import config from 'config'

console.log(config)

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
      remoteURL: config.get('remoteURL')
    }
  }
})
