export default defineNitroPlugin(async () => {
  await ensureDefaultAdmin()
})
