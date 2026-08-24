import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import chokidar from 'chokidar'

const logger = useLogger('websocket')

const peers = new Set<{ send: (data: Record<string, unknown>) => void }>()

/**
 * Single shared file watcher over the data directory. On any config
 * change it reloads the affected config and broadcasts `config:update`
 * (with the config name) to all connected peers.
 */
let watcher: ReturnType<typeof chokidar.watch> | null = null

async function ensureWatcher() {
  if (watcher) {
    return watcher
  }

  const dataDir = path.resolve(process.cwd(), 'data')
  fs.mkdirSync(dataDir, { recursive: true })

  watcher = chokidar.watch(dataDir, {
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 200,
      pollInterval: 50,
    },
  })

  watcher.on('error', (error) => {
    logger.error('Config watcher error', error)
  })

  const onChange = async (fileName: string) => {
    const base = path.basename(fileName)
    const name = configNameFromKey(base)

    if (!name) {
      return
    }

    logger.info(`Config file changed: ${base} (config "${name}")`)

    try {
      const config = await loadConfig(name)
      await setConfig(config, name)
    } catch (e) {
      logger.error(`Failed to reload config "${name}"`, e)
      return
    }

    for (const peer of peers) {
      peer.send({ event: 'config:update', name })
    }
  }

  watcher.on('change', onChange)
  watcher.on('add', onChange)

  return watcher
}

export default defineWebSocketHandler({
  async open(peer) {
    logger.info('Peer connected', peer)

    peers.add(peer)
    await ensureWatcher()
  },
  async message(peer, message) {
    const { event } = JSON.parse(message as unknown as string)

    if (event === 'ping') {
      peer.send({ event: 'pong' })
    }
  },
  async close(peer) {
    peers.delete(peer)
    logger.info('Peer disconnected', peer)
  },
})
