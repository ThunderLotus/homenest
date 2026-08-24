import type { ConfigI18n } from '~/types/config'
import type { Service } from '~/types/services'

/**
 * Language-aware content rendering.  The config's default `title` /
 * `description` fields hold the *base-language* text (typically zh).
 * The optional `i18n` section provides overrides per language code.
 *
 * When the UI locale matches the base language, the default fields are
 * used directly.  For any other locale, the i18n override is preferred
 * and the default field is the fallback.
 *
 * In edit mode the draft's i18n data is used so live edits are reflected
 * immediately on the cards; in view mode the persisted $settings are used.
 */
export function useContentI18n() {
  const { locale } = useI18n()
  const { $settings } = useNuxtApp()
  const editor = useEditor()

  const i18nData = computed<ConfigI18n>(() => {
    if (editor.isEditing.value && editor.draft.value) {
      return editor.draft.value.i18n ?? {}
    }
    return ($settings as any).i18n ?? {}
  })

  const baseLang = computed(() => {
    if (editor.isEditing.value && editor.draft.value) {
      return editor.draft.value.baseLang || 'zh'
    }
    return ($settings as any).baseLang || 'zh'
  })

  const currentLang = computed(() => locale.value)

  function isBaseLang(): boolean {
    return currentLang.value === baseLang.value
  }

  function trPageTitle(defaultTitle?: string): string {
    if (!defaultTitle) {
      return ''
    }
    if (isBaseLang()) {
      return defaultTitle
    }
    return i18nData.value.title?.[currentLang.value] ?? defaultTitle
  }

  function trGroupTitle(defaultTitle?: string): string {
    if (!defaultTitle) {
      return ''
    }
    if (isBaseLang()) {
      return defaultTitle
    }
    return i18nData.value.groups?.[defaultTitle]?.[currentLang.value] ?? defaultTitle
  }

  function trServiceTitle(service: Service): string {
    const base = service.title ?? ''
    if (!base) {
      return ''
    }
    if (isBaseLang()) {
      return base
    }
    return i18nData.value.services?.[service.id]?.[currentLang.value]?.title ?? base
  }

  function trServiceDescription(service: Service): string {
    const base = service.description ?? ''
    if (!base) {
      return ''
    }
    if (isBaseLang()) {
      return base
    }
    return i18nData.value.services?.[service.id]?.[currentLang.value]?.description ?? base
  }

  return {
    currentLang,
    baseLang,
    isBaseLang,
    i18nData,
    trPageTitle,
    trGroupTitle,
    trServiceTitle,
    trServiceDescription,
  }
}
