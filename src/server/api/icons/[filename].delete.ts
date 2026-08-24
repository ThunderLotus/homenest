import { useIconStore } from '~/server/storage'
import { requireAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const filename = getRouterParam(event, 'filename') || ''

  if (!/^[\w.-]+$/.test(filename)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  }

  await useIconStore().delete(filename)

  return { ok: true }
})
