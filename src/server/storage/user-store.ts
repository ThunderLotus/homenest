import type { StorageDriver } from './driver'
import type { StoredUser } from '~/server/utils/auth'

/**
 * User account storage abstraction.
 *
 * Handles the `users.json` collection and the persisted session secret.
 * Both are small enough to load entirely into memory per-request.
 */
export interface UserStore {
  /** Load all users (empty array on first run). */
  list: () => Promise<StoredUser[]>

  /** Persist the full user collection. */
  save: (users: StoredUser[]) => Promise<void>

  /** Read the session-signing secret, creating it on first access. */
  getSessionSecret: () => Promise<string>
}

/**
 * Filesystem / KV-backed UserStore using a shared StorageDriver.
 */
export class DefaultUserStore implements UserStore {
  private static readonly USERS_KEY = 'users.json'
  private static readonly SECRET_KEY = '.session-secret'

  constructor(private driver: StorageDriver) {}

  async list(): Promise<StoredUser[]> {
    const value = await this.driver.get<unknown>(DefaultUserStore.USERS_KEY)

    if (!value) {
      return []
    }

    try {
      const parsed = typeof value === 'string' ? JSON.parse(value) : value
      return Array.isArray(parsed) ? parsed as StoredUser[] : []
    } catch {
      return []
    }
  }

  async save(users: StoredUser[]): Promise<void> {
    await this.driver.set(DefaultUserStore.USERS_KEY, users)
  }

  async getSessionSecret(): Promise<string> {
    const existing = await this.driver.get<string>(DefaultUserStore.SECRET_KEY)

    if (existing) {
      return typeof existing === 'string' ? existing : JSON.stringify(existing)
    }

    const secret = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
    await this.driver.set(DefaultUserStore.SECRET_KEY, secret)
    return secret
  }
}
