export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const username = getRouterParam(event, 'username') || ''
  const body = await readBody<{ newPassword?: string }>(event)
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

  if (!newPassword || newPassword.length > 128) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is required (max 128 characters)',
    })
  }

  const users = await readUsers()
  const idx = users.findIndex((u) => u.username === username)

  if (idx < 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  users[idx] = { ...users[idx]!, password: await hashPassword(newPassword) }
  await writeUsers(users)

  return { ok: true }
})
