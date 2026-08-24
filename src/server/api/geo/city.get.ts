import { getService } from '~/server/utils/services'

interface OWMGeocodingResponse {
  lat: number
  lon: number
  name: string
  country: string
  state?: string
}

export default defineEventHandler(async (event) => {
  const { q, id } = getQuery(event)

  if (!q || !id) {
    throw createError({ statusCode: 400, statusMessage: 'City name and service ID are required' })
  }

  const service = await getService<{ secrets?: { apiKey?: string } }>(event)
  const apiKey = service.secrets?.apiKey

  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'OpenWeatherMap API key is not configured' })
  }

  try {
    const results = await $fetch<OWMGeocodingResponse[]>(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q as string)}&limit=1&appid=${apiKey}`,
    )

    if (!results.length) {
      throw createError({ statusCode: 404, statusMessage: `City "${q}" not found` })
    }

    const r = results[0]!
    return {
      lat: r.lat,
      lon: r.lon,
      place: r.state ? `${r.name}, ${r.state}, ${r.country}` : `${r.name}, ${r.country}`,
    }
  } catch (e: any) {
    if (e?.statusCode) {
      throw e
    }
    const msg = e?.data?.message || 'Failed to search city'
    throw createError({ statusCode: 502, statusMessage: msg })
  }
})
