export type UserRole = 'admin' | 'user'

export interface AuthUser {
  username: string
  role: UserRole
  configName: string
  avatarUrl?: string
  avatarStyle?: string
  avatarSeed?: string
  avatarBgColor?: string
  avatarRadius?: number
}

/**
 * Shared auth state. `useState` must be called from a Nuxt-aware context
 * (setup, plugin, middleware), so it lives inside the composable rather than
 * at module scope.
 */
export function useAuthUser() {
  return useState<AuthUser | null>('auth:user', () => null)
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const { user } = await $fetch<{ user: AuthUser }>('/api/auth/login', {
    method: 'POST',
    body: { username, password },
  })
  useAuthUser().value = user
  return user
}

export async function logout(): Promise<void> {
  await $fetch('/api/auth/logout', { method: 'POST' })
  useAuthUser().value = null
}
