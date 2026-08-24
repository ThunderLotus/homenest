export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const username = typeof query.username === 'string' ? query.username : ''

  if (!username) {
    throw createError({ statusCode: 400, statusMessage: 'Missing username' })
  }

  const user = await getUserByUsername(username)

  // Explicit style/seed override (e.g. the profile panel's live preview of an
  // unsaved selection). Falls back to the stored style otherwise.
  const explicitStyle = typeof query.style === 'string' ? query.style : ''
  const explicitSeed = typeof query.seed === 'string' ? query.seed.slice(0, 64) : ''

  const style = explicitStyle || user?.avatarStyle || ''
  const seed = (explicitStyle ? (explicitSeed || username) : (user?.avatarSeed || username))

  if (!style || !isAvatarStyle(style)) {
    throw createError({ statusCode: 404, statusMessage: 'No generated avatar' })
  }

  const bgColor = typeof query.bgColor === 'string' ? query.bgColor : (user?.avatarBgColor || undefined)

  setResponseHeader(event, 'Content-Type', 'image/svg+xml')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=3600')
  return renderAvatarSvg(style, seed, { backgroundColor: bgColor })
})
