import type { H3Event } from 'h3'
import { Buffer } from 'node:buffer'
import { scryptSync, timingSafeEqual } from 'node:crypto'
import { useSession } from 'h3'
import { useUserStore } from '~/server/storage'
import { AVATAR_STYLES, isAvatarStyle } from './avatar'

export type UserRole = 'admin' | 'user'

export interface StoredUser {
  username: string
  password: string
  role: UserRole
  createdAt: number
  avatarUrl?: string
  avatarStyle?: string
  avatarSeed?: string
  avatarBgColor?: string
  avatarRadius?: number
}

/** Public shape sent to the client (never includes the password hash). */
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

const SESSION_COOKIE = 'homenest_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7
const USERNAME_PATTERN = /^[a-z0-9-]{1,64}$/

const logger = useLogger('auth')

/**
 * Usernames double as config file names (config_<username>.yml), so they are
 * restricted to the same safe charset as config names. The seeded "Admin"
 * account is exempt because it maps to the default config.yml.
 */
export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username)
}

/** Config a user operates on: admin -> default (config.yml), others -> their own. */
export function configNameForUser(user: Pick<StoredUser, 'username' | 'role'>): string {
  return user.role === 'admin' ? 'default' : user.username
}

export function toAuthUser(user: StoredUser): AuthUser {
  return {
    username: user.username,
    role: user.role,
    configName: configNameForUser(user),
    avatarUrl: user.avatarUrl || undefined,
    avatarStyle: user.avatarStyle || undefined,
    avatarSeed: user.avatarSeed || undefined,
    avatarBgColor: user.avatarBgColor || undefined,
    avatarRadius: user.avatarRadius ?? undefined,
  }
}

// ----- password hashing (PBKDF2 via Web Crypto, scrypt fallback for legacy) -----

const PBKDF2_ITERATIONS = 100_000
const PBKDF2_KEY_LENGTH = 64

function bufferToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hexToBuffer(hex: string): Buffer {
  return Buffer.from(hex, 'hex')
}

function timingSafeCompare(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false
  }
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a[i]! ^ b[i]!
  }
  return result === 0
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const algorithm: Pbkdf2Params = { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }
  const hash = await crypto.subtle.deriveBits(algorithm, key, PBKDF2_KEY_LENGTH * 8)
  return `pbkdf2:${bufferToHex(salt)}:${bufferToHex(hash)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(':')
  if (!scheme || !salt || !hash) {
    return false
  }

  if (scheme === 'pbkdf2') {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits'],
    )
    const algorithm: Pbkdf2Params = { name: 'PBKDF2', salt: hexToBuffer(salt) as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' }
    const computed = await crypto.subtle.deriveBits(algorithm, key, PBKDF2_KEY_LENGTH * 8)
    return timingSafeCompare(new Uint8Array(computed), hexToBuffer(hash))
  }

  if (scheme === 'scrypt') {
    const actual = scryptSync(password, salt, 64)
    const expected = Buffer.from(hash, 'hex')
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  }

  return false
}

export function isLegacyPasswordHash(stored: string): boolean {
  return stored.startsWith('scrypt:')
}

// ----- user store (data/users.json) -----

export async function readUsers(): Promise<StoredUser[]> {
  return useUserStore().list()
}

export async function writeUsers(users: StoredUser[]): Promise<void> {
  await useUserStore().save(users)
}

export async function getUserByUsername(username: string): Promise<StoredUser | null> {
  const users = await readUsers()
  return users.find((u) => u.username === username) ?? null
}

// ----- avatar (uploaded image, custom URL, or DiceBear-generated style) -----

const AVATAR_URL_PATTERN = /^(?:https?:\/\/|\/|data:image\/(?:png|jpe?g|webp|gif);base64,)/i
const AVATAR_URL_MAX_LENGTH = 2048
const AVATAR_DATA_MAX_LENGTH = 500_000
const AVATAR_SEED_MAX_LENGTH = 64
const AVATAR_BG_COLOR_PATTERN = /^[0-9a-f]{6}$/i

/**
 * Normalize + validate the avatar request body. Either an image (URL / data
 * URL) or a DiceBear style may be set; empty values clear the field.
 */
export function validateAvatar(input: {
  url?: string
  style?: string
  seed?: string
  bgColor?: string
  radius?: number
}): { url?: string, style?: string, seed?: string, bgColor?: string, radius?: number } {
  const url = (input.url ?? '').trim()
  const style = (input.style ?? '').trim()
  const seed = (input.seed ?? '').trim()
  const bgColor = (input.bgColor ?? '').trim()
  const radius = typeof input.radius === 'number' ? input.radius : undefined

  if (url && !AVATAR_URL_PATTERN.test(url)) {
    throw createError({ statusCode: 400, statusMessage: 'Avatar image must be an http(s), root-relative or data image URL' })
  }

  if (url.length > AVATAR_URL_MAX_LENGTH && !url.startsWith('data:image')) {
    throw createError({ statusCode: 400, statusMessage: 'Avatar URL is too long' })
  }

  if (url.startsWith('data:image') && url.length > AVATAR_DATA_MAX_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: 'Avatar image is too large' })
  }

  if (style && !isAvatarStyle(style)) {
    throw createError({ statusCode: 400, statusMessage: `Avatar style must be one of: ${AVATAR_STYLES.join(', ')}` })
  }

  if (seed && seed.length > AVATAR_SEED_MAX_LENGTH) {
    throw createError({ statusCode: 400, statusMessage: 'Avatar seed is too long' })
  }

  if (bgColor && !AVATAR_BG_COLOR_PATTERN.test(bgColor)) {
    throw createError({ statusCode: 400, statusMessage: 'Avatar background color must be a 6-digit hex (e.g. ff0000)' })
  }

  if (radius !== undefined && (radius < 0 || radius > 100)) {
    throw createError({ statusCode: 400, statusMessage: 'Avatar radius must be between 0 and 100' })
  }

  return {
    url: url || undefined,
    style: style || undefined,
    seed: seed || undefined,
    bgColor: bgColor || undefined,
    radius,
  }
}

export async function updateUserAvatar(
  username: string,
  avatar: { url?: string, style?: string, seed?: string, bgColor?: string, radius?: number },
): Promise<StoredUser> {
  const users = await readUsers()
  const index = users.findIndex((u) => u.username === username)

  if (index < 0) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  users[index]!.avatarUrl = avatar.url || undefined
  users[index]!.avatarStyle = avatar.style || undefined
  users[index]!.avatarSeed = avatar.seed || undefined
  users[index]!.avatarBgColor = avatar.bgColor || undefined
  users[index]!.avatarRadius = avatar.radius ?? undefined
  await writeUsers(users)
  return users[index]!
}

let ensured = false

/** Seed the very first run with the default administrator (Admin/Admin). */
export async function ensureDefaultAdmin(): Promise<void> {
  if (ensured) {
    return
  }
  ensured = true

  const users = await readUsers()
  if (users.length > 0) {
    return
  }

  users.push({
    username: 'Admin',
    password: await hashPassword('Admin'),
    role: 'admin',
    createdAt: Date.now(),
  })
  await writeUsers(users)
  logger.success('Seeded default admin user (Admin/Admin)')
}

// ----- session (cookie, signed with a persisted secret) -----

let cachedSessionSecret: string | null = null

async function getSessionSecret(): Promise<string> {
  if (cachedSessionSecret) {
    return cachedSessionSecret
  }
  cachedSessionSecret = await useUserStore().getSessionSecret()
  return cachedSessionSecret
}

export async function getAuthSession(event: H3Event) {
  return useSession(event, {
    password: await getSessionSecret(),
    maxAge: SESSION_MAX_AGE,
    cookie: {
      name: SESSION_COOKIE,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: false,
    } as any,
  })
}

export async function getSessionUser(event: H3Event): Promise<AuthUser | null> {
  try {
    const session = await getAuthSession(event)
    const username = session.data.username as string | undefined

    if (!username) {
      return null
    }

    const user = await getUserByUsername(username)
    return user ? toAuthUser(user) : null
  } catch {
    return null
  }
}

export async function requireAuth(event: H3Event): Promise<AuthUser> {
  const user = await getSessionUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return user
}

export async function requireAdmin(event: H3Event): Promise<AuthUser> {
  const user = await requireAuth(event)

  if (user.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden',
    })
  }

  return user
}
