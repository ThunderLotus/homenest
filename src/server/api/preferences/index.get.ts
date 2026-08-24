export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  return loadPreferences(auth.configName)
})
