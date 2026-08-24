import { useConfigStore } from '~/server/storage'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const username = getRouterParam(event, 'username') || ''

  // Users may export their own config; admins may export anyone's.
  if (username !== auth.username && auth.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  const user = await getUserByUsername(username)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  const name = configNameForUser(user)
  const store = useConfigStore()
  const config = await store.get(name)

  const snapshot = {
    exportedAt: new Date().toISOString(),
    config: extractSafelyConfig(config),
  }

  const json = JSON.stringify(snapshot, null, 2)
  setResponseHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setResponseHeader(event, 'Content-Disposition', `attachment; filename="homenest-${username}-config.json"`)

  return json
})
