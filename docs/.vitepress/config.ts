import { defineConfig } from 'vitepress'
import en from './locales/en'

export default defineConfig({
  title: 'HomeNest',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],
  themeConfig: {
    search: {
      provider: 'local',
    },

    logo: {
      src: '/logotype.svg',
      innerWidth: 50,
      height: 50,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ThunderLotus/homenest' },
    ],
  },

  ignoreDeadLinks: [
    (url) => {
      return !url.toLowerCase().includes('_parts')
    },
  ],

  locales: {
    root: { label: 'English', ...en },
  },
})
