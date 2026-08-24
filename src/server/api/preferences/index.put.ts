import type { UserPreferences } from '~/server/utils/preferences'

export default defineEventHandler(async (event) => {
  const auth = await requireAuth(event)
  const body = await readBody<{ collapsed?: string[] }>(event)

  const prefs: UserPreferences = {
    collapsed: Array.isArray(body?.collapsed) ? body.collapsed : [],
  }

  await savePreferences(auth.configName, prefs)

  return { ok: true }
})
