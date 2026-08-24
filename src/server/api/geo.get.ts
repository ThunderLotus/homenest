interface IpApiGeoResponse {
  lat: number
  lon: number
  city: string
  regionName: string
  status: string
}

export default defineEventHandler(async (event) => {
  const lang = getQuery(event).lang as string || 'en'
  const response = await $fetch<IpApiGeoResponse>(`http://ip-api.com/json/?fields=lat,lon,city,regionName,status&lang=${lang}`)

  if (response.status !== 'success') {
    throw createError({ statusCode: 502, statusMessage: 'Geo lookup failed' })
  }

  return {
    lat: response.lat,
    lon: response.lon,
    place: `${response.city}, ${response.regionName}`,
  }
})
