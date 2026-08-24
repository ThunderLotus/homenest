export default defineNuxtPlugin(async () => {
  const authUser = useAuthUser()

  if (authUser.value) {
    return
  }

  try {
    // useRequestFetch forwards the incoming request's cookies during SSR so
    // the session survives server-side rendering; on the client it behaves
    // like the regular $fetch (the browser sends cookies automatically).
    const $requestFetch = useRequestFetch()
    authUser.value = await $requestFetch<AuthUser>('/api/auth/me')
  } catch {
    authUser.value = null
  }
})
