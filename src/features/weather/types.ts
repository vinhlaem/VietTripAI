export type WeatherConditionKey =
  | "clearSky"
  | "mainlyClear"
  | "partlyCloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "rainShowers"
  | "thunderstorm"
  | "unknown";

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  conditionKey: WeatherConditionKey;
}

export interface DailyForecast {
  date: string;
  minTemperature: number;
  maxTemperature: number;
  rainProbability: number;
  sunrise: string;
  sunset: string;
  weatherCode: number;
  conditionKey: WeatherConditionKey;
}

export interface WeatherForecast {
  current: CurrentWeather;
  forecast: DailyForecast[];
}

export type NormalizedWeather = WeatherForecast;

export interface OpenMeteoCurrentWeatherResponse {
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  weather_code: number;
  wind_speed_10m: number;
}

export interface OpenMeteoDailyForecastResponse {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  precipitation_probability_max: number[];
  sunrise: string[];
  sunset: string[];
}

export interface OpenMeteoForecastResponse {
  current: OpenMeteoCurrentWeatherResponse;
  daily: OpenMeteoDailyForecastResponse;
}
