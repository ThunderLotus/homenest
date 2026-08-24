import type { UserRole } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const body = await readBody<{ username?: string, password?: string, role?: string }>(event)
  const username = typeof body?.username === 'string' ? body.username.trim() : ''
  const password = typeof body?.password === 'string' ? body.password : ''
  const role: UserRole = body?.role === 'admin' ? 'admin' : 'user'

  if (!isValidUsername(username)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username must be 1-64 characters of a-z, 0-9 or -',
    })
  }

  if (!password || password.length > 128) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is required (max 128 characters)',
    })
  }

  if (await getUserByUsername(username)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Username is already taken',
    })
  }

  const user = {
    username,
    password: await hashPassword(password),
    role,
    createdAt: Date.now(),
  }

  const users = await readUsers()
  users.push(user)
  await writeUsers(users)

  return { user: toAuthUser(user) }
})
