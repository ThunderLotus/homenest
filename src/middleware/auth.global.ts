export default defineNuxtRouteMiddleware((to) => {
  const user = useAuthUser().value

  if (!user) {
    if (to.path === '/login') {
      return
    }

    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  }

  if (to.path === '/login') {
    return navigateTo('/')
  }

  if (to.path.startsWith('/admin') && user.role !== 'admin') {
    return navigateTo('/')
  }
})
