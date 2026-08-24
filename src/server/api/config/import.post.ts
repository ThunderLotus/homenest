import type { CompleteConfig, Service, ServicesGroup } from '~/types'
import { ZodError } from 'zod'
import { useConfigStore } from '~/server/storage'

function toGroups(services: ServicesGroup[] | Record<string, Service[]>): ServicesGroup[] {
  if (Array.isArray(services)) {
    return services
  }

  return Object.entries(services).map(([title, items]) => ({
    title: title || undefined,
    items,
  }))
}

/**
 * Import a site export into the current user's config.
 *
 * `overwrite` replaces the whole config with the imported file; `append`
 * merges imported groups into the existing ones (deduped by stable service
 * id, so re-importing the same file never duplicates cards).
 */
export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody<{ mode?: string, config?: unknown }>(event)

  if (body.mode !== 'append' && body.mode !== 'overwrite') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Import mode must be "append" or "overwrite"',
    })
  }

  const config = body.config as CompleteConfig | undefined

  if (!config || typeof config !== 'object' || !config.services) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Imported file is not a valid site config',
    })
  }

  const name = auth.configName
  const store = useConfigStore()
  const imported = toGroups(config.services as ServicesGroup[] | Record<string, Service[]>)

  let draft: CompleteConfig

  if (body.mode === 'overwrite') {
    draft = { ...config, services: imported }
  } else {
    const current = await store.get(name)
    const merged: ServicesGroup[] = [...current.services]
    const existingIds = new Set(merged.flatMap((group) => group.items.map((item) => item.id)).filter(Boolean) as string[])

    for (const incoming of imported) {
      const fresh = incoming.items.filter((item) => !item.id || !existingIds.has(item.id))

      if (fresh.length === 0) {
        continue
      }

      for (const item of fresh) {
        if (item.id) {
          existingIds.add(item.id)
        }
      }

      const index = merged.findIndex((group) => (group.title ?? '') === (incoming.title ?? ''))

      if (index >= 0) {
        merged[index]!.items.push(...fresh)
      } else {
        merged.push({ ...incoming, items: fresh })
      }
    }

    draft = { ...current, services: merged }
  }

  try {
    await store.update(name, draft)

    return {
      ok: true,
    }
  } catch (e) {
    if (e instanceof ZodError) {
      throw createError({
        statusCode: 422,
        statusMessage: e.message,
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: e instanceof Error ? e.message : 'Failed to import config',
    })
  }
})
