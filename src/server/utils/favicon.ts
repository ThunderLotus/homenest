const USER_AGENT = 'Mozilla/5.0 (homenest dashboard)'
const TIMEOUT = 8000
const MAX_REDIRECTS = 5
const MAX_PAGE_BYTES = 2_000_000

interface FaviconCandidate {
  href: string
  size: number
}

function isImageContentType(type: string): boolean {
  const t = type.toLowerCase()
  return t.startsWith('image/')
    || t.includes('application/octet-stream')
    || t.includes('application/x-ico')
}

function resolveUrl(base: string, href: string): string | null {
  try {
    return new URL(href, base).toString()
  } catch {
    return null
  }
}

function rankCandidate(c: FaviconCandidate): number {
  let rank = c.size > 0 ? c.size : 16
  if (/\.svg/i.test(c.href)) {
    rank += 10_000
  }
  return rank
}

/**
 * Fetch the page at `url` and extract the most suitable favicon: the
 * `rel=icon` <link> with the largest `sizes` (SVG preferred), falling back
 * to `/favicon.ico`. Returns an absolute URL (or data: URL) or null.
 */
export async function lookupFavicon(rawUrl: string): Promise<string | null> {
  let target: URL

  try {
    target = new URL(rawUrl)
  } catch {
    return null
  }

  if (!['http:', 'https:'].includes(target.protocol)) {
    return null
  }

  const candidates: FaviconCandidate[] = []

  try {
    const res = await $fetch.raw(target.toString(), {
      redirect: 'follow',
      maxRedirects: MAX_REDIRECTS,
      timeout: TIMEOUT,
      headers: { 'user-agent': USER_AGENT, 'accept': 'text/html,application/xhtml+xml' },
      responseType: 'text',
    })

    const contentType = String(res.headers.get('content-type') || '')
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      candidates.push({ href: new URL('/favicon.ico', target).toString(), size: 0 })
    } else {
      const html = (res._data as string || '').slice(0, MAX_PAGE_BYTES)
      const linkRe = /<link\b[^>]*>/gi

      for (let match = linkRe.exec(html); match && candidates.length < 20; match = linkRe.exec(html)) {
        const tag = match[0]
        const rel = (/\brel\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1] ?? '').toLowerCase()
        if (!rel.split(/\s+/).some((r) => r === 'icon' || r === 'shortcut icon' || r === 'apple-touch-icon' || r === 'apple-touch-icon-precomposed')) {
          continue
        }

        const href = /\bhref\s*=\s*["']([^"']*)["']/i.exec(tag)?.[1]
        if (!href) {
          continue
        }

        const size = Number.parseInt(/\bsizes\s*=\s*["'](\d+)x\d+["']/i.exec(tag)?.[1] || '0', 10) || 0
        const abs = resolveUrl(target.toString(), href)
        if (abs) {
          candidates.push({ href: abs, size })
        }
      }

      if (!candidates.length) {
        candidates.push({ href: new URL('/favicon.ico', target).toString(), size: 0 })
      }
    }
  } catch {
    candidates.push({ href: new URL('/favicon.ico', target).toString(), size: 0 })
  }

  candidates.sort((a, b) => rankCandidate(b) - rankCandidate(a))

  for (const candidate of candidates) {
    if (await isFetchableIcon(candidate.href)) {
      return candidate.href
    }
  }

  // Fallback: use Google's gstatic faviconV2 service for SPA sites (e.g.
  // Google Analytics) whose HTML has no <link rel="icon"> and whose
  // /favicon.ico returns 404.  We call gstatic directly with the full HTTPS
  // URL instead of the public /s2/favicons endpoint, because the latter
  // internally forces http:// which causes subdomain favicons to resolve to
  // the parent domain's generic icon (e.g. analytics.google.com → Google G
  // instead of the Analytics bar-chart icon).
  const gstaticUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(target.toString())}&size=64`
  if (await isFetchableIcon(gstaticUrl)) {
    return gstaticUrl
  }

  return null
}

/**
 * Verify a candidate actually serves image bytes. A data: URL is accepted
 * as-is (the client <img> can render it directly); remote URLs are fetched.
 */
async function isFetchableIcon(url: string): Promise<boolean> {
  if (url.startsWith('data:')) {
    return url.startsWith('data:image')
  }

  if (!/^https?:\/\//i.test(url)) {
    return false
  }

  try {
    const res = await $fetch.raw(url, {
      redirect: 'follow',
      maxRedirects: MAX_REDIRECTS,
      timeout: TIMEOUT,
      headers: { 'user-agent': USER_AGENT },
      responseType: 'arrayBuffer',
    })

    return isImageContentType(String(res.headers.get('content-type') || ''))
  } catch {
    return false
  }
}
