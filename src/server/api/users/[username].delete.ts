export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const username = getRouterParam(event, 'username') || ''

  if (username === admin.username) {
    throw createError({
      statusCode: 400,
      statusMessage: 'You cannot delete your own account',
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

  // A regular user owns config_<username>.yml; remove it with the account.
  if (users[idx]!.role !== 'admin') {
    const { useStorageDriver } = await import('~/server/storage')
    await useStorageDriver().delete(configFileNameFor(username))
  }

  users.splice(idx, 1)
  await writeUsers(users)

  return { ok: true }
})
