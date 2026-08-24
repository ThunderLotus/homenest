import { useConfigStore } from '~/server/storage'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const requested = getRouterParam(event, 'name') || 'default'

  if (!isValidConfigName(requested)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid config name',
    })
  }

  const auth = await requireAuth(event)
  const name = auth.role === 'admin' ? requested : auth.configName

  const store = useConfigStore()
  const version = await store.getVersion(name)

  return { version }
})
