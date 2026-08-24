import process from 'node:process'
import { ofetch } from 'ofetch'
import { useLogger } from '../utils/logger'

const CURRENT_VERSION = '1.0.0'

export interface ReleasesLatest {
  url: string
  assets_url: string
  upload_url: string
  html_url: string
  id: number
  author: {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    site_admin: boolean
  }
  node_id: string
  tag_name: string
  target_commitish: string
  name: string
  draft: boolean
  prerelease: boolean
  created_at: string
  published_at: string
  assets: Array<any>
  tarball_url: string
  zipball_url: string
  body: string
}

interface CachedResponse {
  data: {
    available: boolean
    version: string
  }
  timestamp: number
}

// Cache duration - 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000

export default defineEventHandler(async () => {
  const storage = useStorage('updates')
  const logger = useLogger('updates')
  const now = Date.now()

  // Get cached response from storage
  const cachedResponse = await storage.getItem<CachedResponse>('latest')

  // Return cached response if it's still valid
  if (cachedResponse && (now - cachedResponse.timestamp) < CACHE_DURATION) {
    logger.debug('Returning cached response:', cachedResponse.data)
    return cachedResponse.data
  } else {
    logger.debug('Fetching latest release:', cachedResponse ? 'cached expired' : 'not cached')
  }

  try {
    const GITHUB_REPO = process.env.HOMENEST_GITHUB_REPO || 'ThunderLotus/homenest'
    if (GITHUB_REPO.includes('ThunderLotus')) {
      logger.debug('GitHub repo not configured, skipping update check')
      return {
        available: false,
        version: CURRENT_VERSION,
      }
    }
    logger.info('Fetching latest release from GitHub')
    const latestReleases = await ofetch<ReleasesLatest>(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`)
    const latestVersion = latestReleases.tag_name.replace('v', '')

    const parseVersion = (version: string): number => Number.parseInt(version.replace(/\./g, ''), 10)
    const difference = parseVersion(latestVersion) - parseVersion(CURRENT_VERSION)

    const response = {
      available: difference > 0,
      version: latestVersion,
    }

    // Cache the response in storage
    await storage.setItem('latest', {
      data: response,
      timestamp: now,
    })

    return response
  } catch (error) {
    logger.error('Failed to fetch the latest release from GitHub API:', error)
    // If GitHub API fails, return cached response if available, otherwise return no update
    if (cachedResponse) {
      return cachedResponse.data
    }

    return {
      available: false,
      version: CURRENT_VERSION,
    }
  }
})
