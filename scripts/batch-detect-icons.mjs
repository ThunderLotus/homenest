import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import process from 'node:process'
import { parse, stringify } from 'yaml'

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const TIMEOUT = 10000
const MAX_REDIRECTS = 5
const MAX_PAGE_BYTES = 2_000_000
const MAX_ICON_SIZE = 5 * 1024 * 1024
const VALID_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp'])

const CONFIG_PATH = 'data/config.yml'
const ICONS_DIR = 'data/icons'

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url)
    const lib = parsed.protocol === 'https:' ? https : http
    const req = lib.get(url, {
      headers: { 'user-agent': USER_AGENT, ...options.headers },
      timeout: TIMEOUT,
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && (options.redirects || 0) < MAX_REDIRECTS) {
        const next = new URL(res.headers.location, url).toString()
        res.resume()
        return fetchUrl(next, { ...options, redirects: (options.redirects || 0) + 1 }).then(resolve, reject)
      }
      const chunks = []
      res.on('data', (c) => chunks.push(c))
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(chunks),
      }))
    })
    req.on('error', reject)
    req.on('timeout', () => {
      req.destroy(new Error('timeout'))
    })
  })
}

function isImageContentType(type) {
  const t = type.toLowerCase()
  return t.startsWith('image/') || t.includes('application/octet-stream') || t.includes('application/x-ico')
}

function resolveUrl(base, href) {
  try {
    return new URL(href, base).toString()
  } catch {
    return null
  }
}

function rankCandidate(c) {
  let rank = c.size > 0 ? c.size : 16
  if (/\.svg/i.test(c.href)) {
    rank += 10000
  }
  return rank
}

async function isFetchableIcon(url) {
  if (url.startsWith('data:')) {
    return url.startsWith('data:image')
  }
  if (!/^https?:\/\//i.test(url)) {
    return false
  }
  try {
    const res = await fetchUrl(url, { responseType: 'buffer' })
    return res.status === 200 && isImageContentType(String(res.headers['content-type'] || ''))
  } catch {
    return false
  }
}

async function lookupFavicon(rawUrl) {
  let target
  try {
    target = new URL(rawUrl)
  } catch {
    return null
  }
  if (!['http:', 'https:'].includes(target.protocol)) {
    return null
  }

  const candidates = []

  try {
    const res = await fetchUrl(target.toString(), {
      headers: { accept: 'text/html,application/xhtml+xml' },
    })
    const contentType = String(res.headers['content-type'] || '')
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      candidates.push({ href: new URL('/favicon.ico', target).toString(), size: 0 })
    } else {
      const html = res.body.toString('utf-8').slice(0, MAX_PAGE_BYTES)
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

  const gstaticUrl = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${encodeURIComponent(target.toString())}&size=64`
  if (await isFetchableIcon(gstaticUrl)) {
    return gstaticUrl
  }

  return null
}

function extFromContentType(type) {
  const t = type.toLowerCase()
  if (t.includes('svg')) {
    return '.svg'
  }
  if (t.includes('png')) {
    return '.png'
  }
  if (t.includes('webp')) {
    return '.webp'
  }
  if (t.includes('gif')) {
    return '.gif'
  }
  if (t.includes('jpeg') || t.includes('jpg')) {
    return '.jpg'
  }
  if (t.includes('ico') || t.includes('x-icon')) {
    return '.ico'
  }
  if (t.includes('bmp')) {
    return '.bmp'
  }
  return '.png'
}

function extFromUrl(url) {
  try {
    const parsed = path.extname(new URL(url).pathname).toLowerCase()
    return VALID_EXTENSIONS.has(parsed) ? parsed : ''
  } catch {
    return ''
  }
}

async function downloadAndSaveIcon(url) {
  let data
  let ext

  if (url.startsWith('data:')) {
    const m = /^data:(image\/[a-z+.-]+)?;base64,(.+)$/i.exec(url)
    if (!m) {
      throw new Error('invalid data URL')
    }
    data = Buffer.from(m[2], 'base64')
    ext = extFromContentType(m[1] || '')
  } else {
    const res = await fetchUrl(url)
    if (res.status !== 200) {
      throw new Error(`HTTP ${res.status}`)
    }
    data = res.body
    const contentType = String(res.headers['content-type'] || '')
    ext = extFromUrl(url) || extFromContentType(contentType)
  }

  if (!data || data.length === 0) {
    throw new Error('empty')
  }
  if (data.length > MAX_ICON_SIZE) {
    throw new Error('too large')
  }

  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16)
  const filename = `${hash}${ext}`
  const filepath = path.join(ICONS_DIR, filename)

  fs.writeFileSync(filepath, data)
  return { localUrl: `/api/icons/${filename}`, filename, size: data.length }
}

async function main() {
  const configRaw = fs.readFileSync(CONFIG_PATH, 'utf8')
  const config = parse(configRaw)
  const services = config.services || {}
  const groupNames = Object.keys(services)

  let total = 0
  let success = 0
  let failed = 0
  let skipped = 0
  const results = []

  for (const groupName of groupNames) {
    total += services[groupName].length
  }
  console.log(`\n总共 ${total} 个服务，开始批量识别...\n`)

  for (const groupName of groupNames) {
    console.log(`\n=== 分组: ${groupName} ===`)
    for (const svc of services[groupName]) {
      const title = svc.title || '(无标题)'
      const link = svc.link || ''

      if (!link) {
        console.log(`  ⏭  ${title} — 无链接，跳过`)
        skipped++
        results.push({ title, link, status: 'skipped', reason: 'no link' })
        continue
      }

      process.stdout.write(`  🔍 ${title} — ${link} ... `)

      try {
        const faviconUrl = await lookupFavicon(link)
        if (!faviconUrl) {
          console.log('❌ 未找到 favicon')
          failed++
          results.push({ title, link, status: 'failed', reason: 'no favicon found' })
          continue
        }

        const { localUrl, filename, size } = await downloadAndSaveIcon(faviconUrl)
        svc.icon = { url: localUrl }
        console.log(`✅ ${filename} (${size} bytes)`)
        success++
        results.push({ title, link, status: 'success', faviconUrl, localUrl, filename, size })
      } catch (e) {
        console.log(`❌ ${e.message}`)
        failed++
        results.push({ title, link, status: 'failed', reason: e.message })
      }
    }
  }

  fs.writeFileSync(CONFIG_PATH, stringify(config), 'utf8')
  console.log(`\n${'='.repeat(60)}`)
  console.log(`完成! 成功: ${success}, 失败: ${failed}, 跳过: ${skipped}, 总计: ${total}`)
  console.log(`配置已保存到 ${CONFIG_PATH}`)

  if (failed > 0) {
    console.log(`\n失败列表:`)
    results.filter((r) => r.status === 'failed').forEach((r) => {
      console.log(`  - ${r.title}: ${r.link} — ${r.reason}`)
    })
  }
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
