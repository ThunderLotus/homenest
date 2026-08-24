import type { Theme } from 'vitepress'
import { yandexMetrika } from '@hywax/vitepress-yandex-metrika'
import DefaultTheme from 'vitepress/theme'
import InVersion from '../components/in-version.vue'
import PreviewImage from '../components/preview-image.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    ctx.app.component('PreviewImage', PreviewImage)
    ctx.app.component('InVersion', InVersion)

    yandexMetrika(ctx, {
      enabled: import.meta.env.MODE === 'production',
      counter: {
        id: 96086220,
        initParams: {
          trustedDomains: ['mafl.hywax.space'],
        },
      },
    })
  },
} satisfies Theme
