import { isLegacyPasswordHash } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ username?: string, password?: string }>(event)
  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password are required',
    })
  }

  const user = await getUserByUsername(username)

  if (!user || !await verifyPassword(password, user.password)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid username or password',
    })
  }

  if (isLegacyPasswordHash(user.password)) {
    const users = await readUsers()
    const idx = users.findIndex((u) => u.username === user.username)
    if (idx >= 0) {
      users[idx] = { ...users[idx]!, password: await hashPassword(password) }
      await writeUsers(users)
    }
  }

  const session = await getAuthSession(event)
  await session.update({ username: user.username })

  return {
    user: toAuthUser(user),
  }
})
