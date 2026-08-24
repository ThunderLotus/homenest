export default defineEventHandler((event) => {
  const url = '/api/config/default'

  return sendRedirect(event, url)
})
