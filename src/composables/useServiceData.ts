import type { BaseService } from '~/types'
import { getActiveConfigName } from '~/plugins/settings'

export interface ServiceDataOptions {
  immediate?: boolean
  updateInterval?: number
}

export function useServiceData<T extends BaseService>(service: T, options?: ServiceDataOptions): any {
  const immediate = options?.immediate || false
  const updateInterval = (options?.updateInterval || 60) * 1000
  const type = service.type || 'base'

  const { data, error, pending, status, refresh, execute } = useFetch(`/api/services/${type}`, {
    immediate,
    query: { id: service.id, configName: getActiveConfigName() },
    timeout: 15000,
  })

  const { pause, resume } = useIntervalFn(refresh, updateInterval, { immediate })

  if (import.meta.client) {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        resume()
      } else {
        pause()
      }
    })
  }

  return {
    data,
    error,
    pending,
    status,
    execute,
    pauseUpdate: pause,
    resumeUpdate: resume,
  }
}
