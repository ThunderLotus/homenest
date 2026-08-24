import { useIconStore } from '~/server/storage'

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename') || ''

  if (!/^[\w.-]+$/.test(filename)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid filename' })
  }

  const data = await useIconStore().load(filename)

  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Icon not found' })
  }

  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase()
  const contentTypes: Record<string, string> = {
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.bmp': 'image/bmp',
  }

  setResponseHeader(event, 'Content-Type', contentTypes[ext] || 'application/octet-stream')
  setResponseHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

  return data
})
