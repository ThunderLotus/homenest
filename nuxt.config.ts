import process from 'node:process'

export default defineNuxtConfig({
  compatibilityDate: '2026-08-23',
  srcDir: 'src',
  dir: {
    public: 'src/public',
  },
  serverDir: 'src/server',
  devServer: {
    port: 13008,
  },
  app: {
    head: {
      link: [
        {
          rel: 'icon',
          href: '/favicons/favicon.ico',
        },
        {
          rel: 'apple-touch-icon',
          href: '/favicons/apple-touch-icon.png',
          sizes: '180x180',
        },
        {
          rel: 'mask-icon',
          href: '/favicons/logo.svg',
        },
      ],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    scope: '/',
    base: '/',
    manifest: {
      id: '/',
      scope: '/',
      name: 'HomeNest — Self-hosted homepage & dashboard',
      short_name: 'HomeNest',
      description: 'HomeNest is a self-hosted, minimalistic homepage and dashboard. Organize your services, monitor their status, and access everything from one place.',
      theme_color: '#609966',
      icons: [
        {
          sizes: '192x192',
          src: 'favicons/pwa-192x192.png',
          type: 'image/png',
        },
        {
          sizes: '512x512',
          src: 'favicons/pwa-512x512.png',
          type: 'image/png',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,txt,png,ico,svg}'],
      navigateFallbackDenylist: [/^\/api\//],
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
    },
    registerWebManifestInRouteRules: true,
    writePlugin: true,
    devOptions: {
      enabled: process.env.VITE_PLUGIN_PWA === 'true',
      navigateFallback: '/',
    },
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
    '@vueuse/nuxt',
    '@vite-pwa/nuxt',
    '@nuxt/icon',
  ],
  i18n: {
    locales: [
      {
        code: 'en',
        iso: 'en-US',
        name: 'English',
        file: 'en-US.js',
      },
      {
        code: 'zh',
        iso: 'zh-CN',
        name: '中文',
        file: 'zh-CN.js',
      },
    ],
    strategy: 'no_prefix',
    langDir: 'locales',
    restructureDir: 'src',
    defaultLocale: 'en',
    bundle: {
      optimizeTranslationDirective: false,
    },
  },
  tailwindcss: {
    cssPath: '~/assets/style/tailwind.css',
  },
  colorMode: {
    classSuffix: '',
  },
  nitro: {
    storage: {
      data: {
        driver: 'fs',
        base: './data',
      },
    },
    routeRules: {
      '/login': { prerender: true },
      '/api/config/**/version': { swr: 10 },
      '/api/services/**': { swr: 60 },
    },
    experimental: {
      websocket: process.env.MAFL_STORAGE_DRIVER !== 'vercel-kv' && !process.env.KV_REST_API_URL,
      tasks: true,
    },
  },
})
