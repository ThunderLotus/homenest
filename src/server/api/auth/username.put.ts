export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody<{ username?: string }>(event)
  const next = typeof body?.username === 'string' ? body.username.trim() : ''

  if (!isValidUsername(next)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username must be 1-64 characters of a-z, 0-9 or -',
    })
  }

  if (next === auth.username) {
    return { user: auth }
  }

  if (await getUserByUsername(next)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Username is already taken',
    })
  }

  const users = await readUsers()
  const idx = users.findIndex((u) => u.username === auth.username)

  if (idx < 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Regular users are keyed by username in config_<username>.yml, so a rename
  // must carry the config file over. Admin maps to config.yml and is untouched.
  if (auth.role !== 'admin') {
    await renameConfigFile(auth.username, next)
  }

  const updated = { ...users[idx]!, username: next }
  users[idx] = updated
  await writeUsers(users)

  const session = await getAuthSession(event)
  await session.update({ username: next })

  return { user: toAuthUser(updated) }
})
