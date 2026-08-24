export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody<{ url?: string, style?: string, seed?: string, bgColor?: string, radius?: number }>(event)

  const avatar = validateAvatar({
    url: typeof body?.url === 'string' ? body.url : undefined,
    style: typeof body?.style === 'string' ? body.style : undefined,
    seed: typeof body?.seed === 'string' ? body.seed : undefined,
    bgColor: typeof body?.bgColor === 'string' ? body.bgColor : undefined,
    radius: typeof body?.radius === 'number' ? body.radius : undefined,
  })

  const updated = await updateUserAvatar(auth.username, avatar)

  return { user: toAuthUser(updated) }
})
