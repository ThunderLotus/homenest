export default defineEventHandler(async (event) => {
  return requireAuth(event)
})
