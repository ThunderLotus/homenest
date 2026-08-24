import type { OpenWeatherMapService } from '~/types'
import { getServiceWithDefaultData, returnServiceWithData } from '~/server/utils/services'

interface OWMResponse {
  main: {
    temp: number
  }
  name: string
  weather: {
    id: number
    description: string
  }[]
}

const cachedOWMData = defineCachedFunction(async ({ lon, lat, units, apiKey, lang }: { lon: number, lat: number, units: string, apiKey: string, lang: string }) => {
  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'OpenWeatherMap API key is not configured' })
  }
  try {
    const response = await $fetch<OWMResponse>(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}&lang=${lang}`)
    return {
      temp: response.main.temp,
      place: response.name,
      iconId: response.weather[0]!.id,
      description: response.weather[0]!.description,
    }
  } catch (e: any) {
    const msg = e?.data?.message || e?.statusMessage || 'Failed to fetch weather data'
    throw createError({ statusCode: e?.statusCode || 502, statusMessage: msg })
  }
}, { maxAge: 60 * 24, getKey: ({ lon, lat }) => `${lon}-${lat}` })

export default defineEventHandler(async (event) => {
  const service = await getServiceWithDefaultData<OpenWeatherMapService>(event)
  const { configName } = getQuery(event)
  const config = await getConfig(configName as string || 'default')
  const { options, secrets } = service.config
  const owm = await cachedOWMData({
    lon: options.lon,
    lat: options.lat,
    units: options.units || 'metric',
    apiKey: secrets.apiKey,
    lang: config?.lang || 'en',
  })

  return returnServiceWithData(service, owm)
})
