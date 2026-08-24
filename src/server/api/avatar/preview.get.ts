export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const style = typeof query.style === 'string' ? query.style : ''
  const seed = typeof query.seed === 'string' ? query.seed.slice(0, 64) : 'preview'

  if (!style || !isAvatarStyle(style)) {
    throw createError({ statusCode: 404, statusMessage: 'Unknown avatar style' })
  }

  const bgColor = typeof query.bgColor === 'string' ? query.bgColor : undefined

  setResponseHeader(event, 'Content-Type', 'image/svg+xml')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return renderAvatarSvg(style, seed, { backgroundColor: bgColor })
})
