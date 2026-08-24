export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const users = await readUsers()
  return users.map(toAuthUser)
})
