export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody<{ currentPassword?: string, newPassword?: string }>(event)
  const currentPassword = typeof body?.currentPassword === 'string' ? body.currentPassword : ''
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

  if (!currentPassword || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Current and new password are required',
    })
  }

  if (newPassword.length > 128) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is too long',
    })
  }

  const user = await getUserByUsername(auth.username)

  if (!user || !await verifyPassword(currentPassword, user.password)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Current password is incorrect',
    })
  }

  const users = await readUsers()
  const idx = users.findIndex((u) => u.username === user.username)

  if (idx < 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  users[idx] = { ...user, password: await hashPassword(newPassword) }
  await writeUsers(users)

  return { ok: true }
})
