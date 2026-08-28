import { useEffect, useState } from 'react'
import axios from 'axios'

const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

export const Weather = ({ country }) => {
  const [weather, setWeather] = useState(null)
  const [lat, lon] = country.capitalInfo?.latlng ?? []

  useEffect(() => {
    if (lat == null || lon == null || !apiKey) return

    axios
      .get('https://api.openweathermap.org/data/2.5/weather', {
        params: {
          lat,
          lon,
          appid: apiKey,
          units: 'metric',
        },
      })
      .then(response => setWeather(response.data))
  }, [lat, lon])

  if (!apiKey) return <p>Weather API key is missing.</p>
  if (lat == null || lon == null) return <p>Weather is unavailable.</p>
  if (!weather) return <p>Loading weather...</p>

  return (
    <div>
      <h2>Weather in {country.capital?.[0]}</h2>
      <p>Temperature {weather.main.temp} °C</p>
      <p>Wind {weather.wind.speed} m/s</p>
      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
        alt={weather.weather[0].description}
      />
    </div>
  )
}
