import type { CompleteConfig, Service, Tag } from '~/types'
import type { StyleCard, StyleGroup } from '~/types/style'
import crypto from 'node:crypto'
import defu from 'defu'
import yaml from 'yaml'
import { ZodError } from 'zod'
import { useStorageDriver } from '~/server/storage'
import { configDraftSchema, configSchema } from '~/server/validations'
import { CARD_STYLE_DEFAULTS, GROUP_STYLE_DEFAULTS, STYLE_TITLE_DEFAULTS } from '~/utils/style'

type DraftService = Partial<Service>

type TagMap = Map<Tag['name'], Tag>

const logger = useLogger('config')

function determineService(items: DraftService[], tags: TagMap): Service[] {
  return items.map((item): Service => ({
    ...item,
    id: item.id || crypto.randomUUID(),
    tags: (item.tags || []).map((tag): Tag => {
      if (typeof tag === 'string') {
        return tags.get(tag) || {
          name: tag,
          color: 'blue',
        }
      }

      return tag
    }),
  }))
}

export const configFileName = 'config.yml'

/**
 * Validate a config name for use in URLs and filenames.
 * Rejects path traversal, empty and overlong names.
 */
const namePattern = /^[a-z0-9-]{1,64}$/

export function isValidConfigName(name: string): boolean {
  return namePattern.test(name)
}

/**
 * Map a config name to its storage filename.
 * - name === 'default' (or empty) -> config.yml (backward compatible)
 * - otherwise                   -> config_<name>.yml
 */
export function configFileNameFor(name: string): string {
  if (!name || name === 'default') {
    return configFileName
  }

  if (!isValidConfigName(name)) {
    throw new TypeError(`Invalid config name: ${name}`)
  }

  return `config_${name}.yml`
}

/**
 * Whether a config file exists on disk. A named config is created by its
 * first save, so the API uses this to tell "brand new config" (return a
 * fresh default without error) apart from "existing but broken" (surface
 * the parse error).
 */
export async function hasConfigFile(name: string): Promise<boolean> {
  const driver = useStorageDriver()
  return driver.has(configFileNameFor(name))
}

/**
 * Move a user's config file from one name to another (used when a regular
 * user renames their account). Missing source files are a no-op; the
 * destination is never overwritten.
 */
export async function renameConfigFile(oldName: string, newName: string): Promise<void> {
  if (oldName === newName) {
    return
  }

  const driver = useStorageDriver()
  const oldFile = configFileNameFor(oldName)
  const newFile = configFileNameFor(newName)

  if (!await driver.has(oldFile)) {
    return
  }

  const raw = await driver.get<string>(oldFile)
  await driver.set(newFile, raw)
  await driver.delete(oldFile)
}

/**
 * Parse a storage key (e.g. `config_foo.yml` or `config.yml`) back into a
 * config name. Keys are relative to the `data` mountpoint; a `data:` prefix
 * (used by the top-level unstorage watcher) is tolerated.
 */
export function configNameFromKey(key: string): string | null {
  const normalized = key.startsWith('data:') ? key.slice(5) : key
  const match = /^config_([a-z0-9-]{1,64})\.yml$/.exec(normalized)

  if (match) {
    return match[1] ?? null
  }

  if (normalized === configFileName) {
    return 'default'
  }

  return null
}

/**
 * Whitelisted top-level service fields kept when persisting to yaml.
 * Drops runtime data (`server`). `id` is persisted so secrets can be
 * recovered by stable id across saves (even after title/link edits).
 * `secrets` is handled separately (kept only when non-empty, re-filled
 * on save from the on-disk copy, `null` explicitly clears).
 * Keeps `style` (custom).
 */
const persistServiceKeys: Array<keyof Service> = [
  'id',
  'title',
  'description',
  'link',
  'target',
  'icon',
  'tags',
  'status',
  'type',
  'options',
  'style',
  'secrets',
]

function pickPersistableService(service: Service): Record<string, unknown> {
  const out: Record<string, unknown> = {}

  for (const key of persistServiceKeys) {
    const value = service[key]

    if (value === undefined) {
      continue
    }

    if (key === 'secrets') {
      if (value === null || Object.keys(value).length === 0) {
        continue
      }

      out[key] = value
      continue
    }

    out[key] = value
  }

  return out
}

export function getDefaultConfig(): CompleteConfig {
  return {
    title: 'HomeNest',
    lang: 'en',
    baseLang: 'en',
    theme: 'system',
    checkUpdates: true,
    layout: {
      grid: {
        small: 2,
        medium: 2,
        large: 3,
        xlarge: 4,
      },
    },
    behaviour: {
      target: '_blank',
    },
    tags: [],
    services: [],
    i18n: {},
    style: {
      // The theme's unified defaults. Cards/groups inherit these unless they
      // carry their own override, and the editor's theme reset restores
      // exactly this set.
      title: { ...STYLE_TITLE_DEFAULTS },
      card: { ...CARD_STYLE_DEFAULTS } as StyleCard,
      group: { ...GROUP_STYLE_DEFAULTS } as StyleGroup,
    },
  }
}

function createTagMap(tags: Tag[]): TagMap {
  return tags.reduce((acc, tag) => {
    acc.set(tag.name, tag)

    return acc
  }, new Map())
}

/**
 * Load config from storage
 * @param name config name ('default' or a named config), defaults to 'default'
 */
export async function loadConfig(name: string = 'default'): Promise<CompleteConfig> {
  const defaultConfig = getDefaultConfig()
  const driver = useStorageDriver()
  const fileName = configFileNameFor(name)

  try {
    if (!await driver.has(fileName)) {
      return defaultConfig
    }

    const raw = await driver.get<string>(fileName)
    const config = yaml.parse(raw || '') || {}
    const services: CompleteConfig['services'] = []
    const tags: TagMap = createTagMap(config.tags || [])

    configSchema.parse(config)

    if (Array.isArray(config.services)) {
      services.push({
        items: determineService(config.services, tags),
      })
    } else {
      const entries = Object.entries<DraftService[]>(config.services || [])

      for (const [title, items] of entries) {
        services.push({
          title,
          items: determineService(items, tags),
        })
      }
    }

    return defu({ ...config, services }, defaultConfig)
  } catch (e) {
    logger.error(e)

    if (e instanceof Error) {
      defaultConfig.error = e.message
    }

    if (e instanceof ZodError) {
      defaultConfig.error = JSON.stringify(
        e.format(),
        (key, val) => (key === '_errors' && !val.length) ? undefined : val,
        ' ',
      )
    }
  }

  return defaultConfig
}

/**
 * Save config to memory storage, keyed by config name so multiple
 * named configs can coexist in the `main` storage.
 */
export async function setConfig(config: CompleteConfig, name: string = 'default'): Promise<void> {
  const storage = useStorage('main')
  const configKey = name === 'default' ? 'config' : `config:${name}`
  const servicesKey = name === 'default' ? 'services' : `services:${name}`

  await storage.setItem(configKey, config)
  await storage.setItem(servicesKey, extractServicesFromConfig(config))

  logger.success(`Set "main" config (${configKey})`)
}

/**
 * Get config from memory storage, keyed by config name.
 */
export async function getConfig(name: string = 'default'): Promise<CompleteConfig | null> {
  const storage = useStorage('main')
  const configKey = name === 'default' ? 'config' : `config:${name}`

  return storage.getItem<CompleteConfig>(configKey)
}

/**
 * Get services map from memory storage, keyed by config name.
 */
export async function getServices(name: string = 'default'): Promise<Record<string, Service> | null> {
  const storage = useStorage('main')
  const servicesKey = name === 'default' ? 'services' : `services:${name}`

  return storage.getItem<Record<string, Service>>(servicesKey)
}

/**
 * Convert the in-memory grouped services back to the raw yaml structure
 * (flat array when there is a single unnamed group, otherwise record).
 * Mirrors the inverse of the branch in `loadConfig`.
 */
function servicesToRaw(groups: CompleteConfig['services']): DraftService[] | Record<string, DraftService[]> {
  const single = groups.length === 1 && !groups[0]!.title

  if (single) {
    return groups[0]!.items as DraftService[]
  }

  return groups.reduce<Record<string, DraftService[]>>((acc, group) => {
    const key = group.title || ''

    // The raw yaml format keys groups by title, so duplicate titles (e.g. two
    // untitled groups created by the editor) must be merged instead of
    // overwriting the earlier group's items — otherwise cards silently vanish.
    acc[key] = [...(acc[key] ?? []), ...(group.items as DraftService[])]

    return acc
  }, {})
}

/**
 * Serialize a config draft back to yaml and persist to disk.
 *
 * Steps:
 * 1. convert grouped draft back to raw structure and zod-validate it
 *    (reject with thrown ZodError -> 422 upstream)
 * 2. read the on-disk copy to recover `secrets` by **stable service id**
 *    for services that did not carry any (edits to title/link don't break
 *    the match; `secrets: null` explicitly clears and never recovers)
 * 3. strip runtime fields (`server`, empty `secrets`) via whitelist,
 *    persist `id`
 * 4. yaml.stringify + atomic write via unstorage fs driver
 *
 * @returns the persisted yaml string
 */
export async function saveConfig(name: string, draft: CompleteConfig): Promise<string> {
  const driver = useStorageDriver()
  const fileName = configFileNameFor(name)

  configDraftSchema.parse(draft)

  const oldSecrets = await readSecretsById(fileName)
  const flat = draft.services.flatMap((group) => group.items)

  const services: CompleteConfig['services'] = draft.services.map((group) => ({
    ...group,
    items: group.items.map((service) => {
      const filled: Service = { ...service }

      filled.id ||= crypto.randomUUID()

      if (filled.secrets === null) {
        delete filled.secrets
      } else if (!filled.secrets || Object.keys(filled.secrets).length === 0) {
        const composite = compositeKeyFor(service, flat.indexOf(service), flat)
        const old = filled.id
          ? (oldSecrets.get(filled.id) ?? oldSecrets.get(composite) ?? oldSecrets.get(baseCompositeKeyFor(service)))
          : oldSecrets.get(composite)

        if (old) {
          filled.secrets = old
        }
      }

      return pickPersistableService(filled) as unknown as Service
    }),
  }))

  const { error: _error, ...rest } = draft

  const clean: CompleteConfig = {
    ...rest,
    services,
  }

  const raw: Record<string, unknown> = {
    ...clean,
    services: servicesToRaw(services),
  }

  configSchema.parse(raw)

  const serialized = yaml.stringify(raw)

  await driver.set(fileName, serialized)

  return serialized
}

/**
 * Read the on-disk config and build service id -> secrets map.
 *
 * Services carrying an `id` are indexed by that id (stable, survives
 * title/link edits). Legacy services *without* an id (pre-persistence
 * files) are additionally indexed by their composite key
 * (type|title|link|occurrence) so a first save from an old config still
 * recovers its secrets — a one-time migration fallback that becomes
 * irrelevant once ids are written.
 *
 * Returns an empty map when the file does not exist (nothing to
 * recover); throws on any read/parse error so the caller aborts the
 * save instead of silently wiping secrets (S2).
 */
async function readSecretsById(fileName: string): Promise<Map<string, Record<string, any>>> {
  const driver = useStorageDriver()

  if (!await driver.has(fileName)) {
    return new Map()
  }

  const raw = await driver.get<string>(fileName)
  const config = yaml.parse(raw || '') || {}
  const map = new Map<string, Record<string, any>>()

  const flat: DraftService[] = []

  if (Array.isArray(config.services)) {
    flat.push(...config.services)
  } else {
    for (const items of Object.values<DraftService[]>(config.services || {})) {
      flat.push(...items)
    }
  }

  flat.forEach((item, index) => {
    if (!item.secrets || Object.keys(item.secrets).length === 0) {
      return
    }

    if (item.id) {
      map.set(item.id, item.secrets)
    }

    map.set(compositeKeyFor(item, index, flat), item.secrets)
    map.set(baseCompositeKeyFor(item), item.secrets)
  })

  return map
}

/**
 * Legacy composite lookup key (type|title|link|occurrence). Used only
 * as a migration fallback for services without a persisted id, so both
 * sides must count occurrence over the same fully-flattened list.
 */
function compositeKeyFor(item: DraftService, index: number, flat: DraftService[]): string {
  const occurrence = flat.filter((it, i) => i < index && sameComposite(it, item)).length

  return `${String(item.type ?? 'base')}|${item.title ?? ''}|${item.link ?? ''}|${occurrence}`
}

/**
 * Title/link composite without occurrence. Used as a second-chance fallback
 * so a service duplicated by the editor (fresh id, same type/title/link/options)
 * inherits the original's secrets after a save. `options` is included so two
 * distinct cards that share type/title/link (e.g. OpenWeatherMap in different
 * cities) do NOT inherit each other's key.
 */
function baseCompositeKeyFor(item: DraftService): string {
  return `${String(item.type ?? 'base')}|${item.title ?? ''}|${item.link ?? ''}|${JSON.stringify(item.options ?? {})}`
}

function sameComposite(a: DraftService, b: DraftService): boolean {
  return (a.type ?? 'base') === (b.type ?? 'base')
    && (a.title ?? '') === (b.title ?? '')
    && (a.link ?? '') === (b.link ?? '')
}

/**
 * Safely retrieves a list of services for frontend.
 * Omit "secrets" fields.
 */
export function extractSafelyConfig(config: CompleteConfig) {
  return JSON.parse(JSON.stringify(
    config, (key, val) => key === 'secrets' ? undefined : val,
  ))
}

/**
 * Create Map services
 */
export function extractServicesFromConfig(config: CompleteConfig): Record<string, Service> {
  return config.services.reduce<Record<string, Service>>((acc, group) => {
    for (const item of group.items) {
      acc[item.id] = item
    }

    return acc
  }, {})
}
