import type { H3Event } from 'h3'
import type { PingServiceData, ReturnServiceWithData, Service, ServiceWithDefaultData } from '~/types'
import { useConfigStore } from '~/server/storage'

export async function pingService(endpoint: string): Promise<PingServiceData> {
  try {
    const start = Date.now()
    await fetch(endpoint, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    })
    return {
      status: true,
      time: Date.now() - start,
    }
  } catch (e) {
    logger.error(e)
  }

  return {
    status: false,
    time: 0,
  }
}

export async function getService<T extends Service>(event: H3Event): Promise<T> {
  const { id, configName } = getQuery<{ id?: string, configName?: string }>(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID can not be null',
    })
  }

  const name = (configName && configName !== 'default') ? configName : 'default'
  const servicesKey = name === 'default' ? 'services' : `services:${name}`

  const storage = useStorage('main')
  let services = await storage.getItem<Record<string, T>>(servicesKey)

  if (!services) {
    await useConfigStore().get(name)
    services = await storage.getItem<Record<string, T>>(servicesKey)
  }

  if (!services || !Object.hasOwn(services, id)) {
    throw createError({
      statusCode: 404,
      statusMessage: `Service with ID "${id}" does not exist`,
    })
  }

  return services[id]!
}

export async function getServiceWithDefaultData<S extends Service>(event: H3Event): Promise<ServiceWithDefaultData<S>> {
  const config = await getService<S>(event)
  const defaultData = {
    ping: config?.status?.enabled ? await pingService(config.link || '') : undefined,
  }

  return { config, defaultData }
}

export function returnServiceWithData<
  S extends ServiceWithDefaultData<Service>,
  D extends S['config']['server'] = S['config']['server'],
>(service: S, data: D): ReturnServiceWithData<D, S['defaultData']> {
  return {
    ...service.defaultData,
    data,
  }
}
