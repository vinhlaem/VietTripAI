import type { NormalizedWeather } from "../types";
import { normalizeWeather } from "../utils/normalizeWeather";

const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const weatherCache = new Map<string, NormalizedWeather>();

function assertCoordinate(value: number, label: "latitude" | "longitude") {
  if (!Number.isFinite(value)) {
    throw new Error(`Unable to load weather: ${label} is invalid.`);
  }
}

function getCacheKey(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
}

function buildForecastUrl(latitude: number, longitude: number) {
  const url = new URL(OPEN_METEO_FORECAST_URL);
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m",
    timezone: "auto",
  });

  url.search = params.toString();
  return url;
}

export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<NormalizedWeather> {
  assertCoordinate(latitude, "latitude");
  assertCoordinate(longitude, "longitude");

  const cacheKey = getCacheKey(latitude, longitude);
  const cachedWeather = weatherCache.get(cacheKey);

  if (cachedWeather) {
    return cachedWeather;
  }

  const response = await fetch(buildForecastUrl(latitude, longitude), {
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `Unable to load weather: ${response.status} ${response.statusText}`,
    );
  }

  const payload: unknown = await response.json();
  const weather = normalizeWeather(payload);

  weatherCache.set(cacheKey, weather);
  return weather;
}
