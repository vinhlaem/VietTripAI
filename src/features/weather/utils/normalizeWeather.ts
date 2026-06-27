import type {
  NormalizedWeather,
  OpenMeteoDailyForecastResponse,
  OpenMeteoForecastResponse,
} from "../types";
import { getWeatherConditionKey } from "./weatherCode";

const FORECAST_DAYS = 3;

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every(isNumber);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function hasDailyForecastShape(value: unknown): value is OpenMeteoDailyForecastResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    isStringArray(candidate.time) &&
    isNumberArray(candidate.weather_code) &&
    isNumberArray(candidate.temperature_2m_max) &&
    isNumberArray(candidate.temperature_2m_min) &&
    isNumberArray(candidate.precipitation_probability_max) &&
    isStringArray(candidate.sunrise) &&
    isStringArray(candidate.sunset)
  );
}

function hasOpenMeteoShape(value: unknown): value is OpenMeteoForecastResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const current = candidate.current;

  if (!current || typeof current !== "object") {
    return false;
  }

  const currentCandidate = current as Record<string, unknown>;

  return (
    isNumber(currentCandidate.temperature_2m) &&
    isNumber(currentCandidate.relative_humidity_2m) &&
    isNumber(currentCandidate.apparent_temperature) &&
    isNumber(currentCandidate.is_day) &&
    isNumber(currentCandidate.weather_code) &&
    isNumber(currentCandidate.wind_speed_10m) &&
    hasDailyForecastShape(candidate.daily)
  );
}

function ensureDailyForecastLength(daily: OpenMeteoDailyForecastResponse) {
  const lengths = [
    daily.time.length,
    daily.weather_code.length,
    daily.temperature_2m_max.length,
    daily.temperature_2m_min.length,
    daily.precipitation_probability_max.length,
    daily.sunrise.length,
    daily.sunset.length,
  ];

  if (lengths.some((length) => length < FORECAST_DAYS)) {
    throw new Error("Unable to load weather: incomplete forecast data.");
  }
}

export function normalizeWeather(response: unknown): NormalizedWeather {
  if (!hasOpenMeteoShape(response)) {
    throw new Error("Unable to load weather: unexpected response format.");
  }

  ensureDailyForecastLength(response.daily);

  return {
    current: {
      temperature: response.current.temperature_2m,
      feelsLike: response.current.apparent_temperature,
      humidity: response.current.relative_humidity_2m,
      windSpeed: response.current.wind_speed_10m,
      weatherCode: response.current.weather_code,
      conditionKey: getWeatherConditionKey(response.current.weather_code),
    },
    forecast: response.daily.time.slice(0, FORECAST_DAYS).map((date, index) => {
      const weatherCode = response.daily.weather_code[index];

      return {
        date,
        minTemperature: response.daily.temperature_2m_min[index],
        maxTemperature: response.daily.temperature_2m_max[index],
        rainProbability: response.daily.precipitation_probability_max[index],
        sunrise: response.daily.sunrise[index],
        sunset: response.daily.sunset[index],
        weatherCode,
        conditionKey: getWeatherConditionKey(weatherCode),
      };
    }),
  };
}
