import { Buffer } from 'node:buffer'
import crypto from 'node:crypto'
import path from 'node:path'
import { useIconStore } from '~/server/storage'

const VALID_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp'])
const MAX_ICON_SIZE = 5 * 1024 * 1024
const TIMEOUT = 10000

function extFromContentType(type: string): string {
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

function extFromUrl(url: string): string {
  const parsed = path.extname(new URL(url).pathname).toLowerCase()
  return VALID_EXTENSIONS.has(parsed) ? parsed : ''
}

/**
 * Download an icon from `url`, store it under `data/icons/<hash><ext>`,
 * and return the local serving path `/api/icons/<hash><ext>`.
 */
export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody<{ url?: string }>(event)
  const url = (body?.url ?? '').trim()

  if (!url || !/^https?:\/\//i.test(url)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid icon URL' })
  }

  let data: ArrayBuffer
  let contentType = ''

  try {
    const res = await $fetch.raw(url, {
      redirect: 'follow',
      maxRedirects: 5,
      timeout: TIMEOUT,
      headers: { 'user-agent': 'Mozilla/5.0 (homenest dashboard)' },
      responseType: 'arrayBuffer',
    })
    data = res._data as ArrayBuffer
    contentType = String(res.headers.get('content-type') || '')
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'Failed to download icon' })
  }

  if (!data || data.byteLength === 0) {
    throw createError({ statusCode: 502, statusMessage: 'Icon is empty' })
  }

  if (data.byteLength > MAX_ICON_SIZE) {
    throw createError({ statusCode: 413, statusMessage: 'Icon is too large (max 5 MB)' })
  }

  const ext = extFromUrl(url) || extFromContentType(contentType)
  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16)
  const filename = `${hash}${ext}`

  await useIconStore().save(filename, Buffer.from(data))

  return { localUrl: `/api/icons/${filename}` }
})
