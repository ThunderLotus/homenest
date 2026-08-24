import type { Service } from '~/types'

/**
 * Live card search driven by the homepage search box. Module-level singleton:
 * the Toolbar input and every rendered Group share one reactive query, so
 * filtering stays in sync without a page reload.
 */
const query = ref('')

function normalizeTags(tags: Service['tags'] = []): string {
  return tags
    .map((tag) => (typeof tag === 'string' ? tag : (tag as { name?: string }).name ?? ''))
    .filter(Boolean)
    .join(' ')
}

export function matches(item: Service): boolean {
  const q = query.value.trim().toLowerCase()
  if (!q) {
    return true
  }

  const haystack = [item.title, item.description, item.link, normalizeTags(item.tags)]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return haystack.includes(q)
}

export function useDashboardSearch() {
  return {
    query,
    active: computed(() => query.value.trim().length > 0),
    matches,
  }
}
