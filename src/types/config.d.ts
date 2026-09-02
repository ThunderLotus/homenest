import type { Service } from '~/types/services'
import type { Style } from '~/types/style'

export interface ServicesGroup {
  title?: string
  items: Service[]
}

export interface Tag {
  name: string
  color: 'red' | 'orange' | 'amber' | 'yellow' | 'lime' | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky' | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia' | 'pink' | 'rose'
}

export interface Behaviour {
  target?: '_blank' | '_self' | '_parent' | '_top'
}

export interface Layout {
  grid: {
    small: number
    medium: number
    large: number
    xlarge: number
  }
}

export interface ServiceI18nEntry {
  title?: string
  description?: string
}

export interface ConfigI18n {
  title?: Record<string, string>
  groups?: Record<string, Record<string, string>>
  services?: Record<string, Record<string, ServiceI18nEntry>>
}

export interface Config {
  title?: string
  version?: string
  lang?: 'en' | 'ru' | 'zh' | 'hi' | 'es' | 'ar' | 'pl' | 'fr' | 'de' | 'gr' | 'nl'
  baseLang?: string
  theme?: 'system' | 'light' | 'dark' | 'deep' | 'sepia' | 'bluer'
  layout?: Layout
  behaviour?: Behaviour
  tags: Tag[]
  services: ServicesGroup[]
  checkUpdates: boolean
  style?: Style
  i18n?: ConfigI18n
}

export type CompleteConfig = Required<Config> & {
  error?: string
}
