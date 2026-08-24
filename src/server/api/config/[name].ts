import type { CompleteConfig } from '~/types'
import { ZodError } from 'zod'
import { useConfigStore } from '~/server/storage'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const requested = getRouterParam(event, 'name') || 'default'

  if (!isValidConfigName(requested)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid config name',
    })
  }

  // Only admins may address named configs directly; everyone else is pinned
  // to their own config (admin -> default, users -> config_<username>.yml).
  const name = auth.role === 'admin' ? requested : auth.configName
  const store = useConfigStore()

  if (event.method === 'PUT') {
    const body = await readBody<CompleteConfig>(event)

    try {
      await store.update(name, body)

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
        statusMessage: e instanceof Error ? e.message : 'Failed to save config',
      })
    }
  }

  const config = await store.get(name)

  return extractSafelyConfig(config)
})
