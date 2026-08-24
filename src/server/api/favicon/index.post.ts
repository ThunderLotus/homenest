import { lookupFavicon } from '~/server/utils/favicon'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody<{ url?: string }>(event)
  const url = (body?.url ?? '').trim()

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url' })
  }

  const found = await lookupFavicon(url)

  return { url: found }
})
