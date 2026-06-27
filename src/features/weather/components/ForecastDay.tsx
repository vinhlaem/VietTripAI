import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Moon,
  Sunrise,
  Sun,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import type { DailyForecast, WeatherConditionKey } from "../types";
import styles from "./Weather.module.scss";

type ForecastDayProps = {
  forecast: DailyForecast;
};

const forecastIcons: Record<WeatherConditionKey, LucideIcon> = {
  clearSky: Sun,
  mainlyClear: CloudSun,
  partlyCloudy: CloudSun,
  overcast: Cloud,
  fog: CloudFog,
  drizzle: Droplets,
  rain: CloudRain,
  snow: CloudSnow,
  rainShowers: CloudRain,
  thunderstorm: CloudLightning,
  unknown: CloudSun,
};


function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

function formatTime(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ForecastDay({ forecast }: ForecastDayProps) {
  const locale = useLocale();
  const weather = useTranslations("Weather");
  const Icon = forecastIcons[forecast.conditionKey];

  return (
    <article className={styles.forecastDay}>
      <div className={styles.forecastTopline}>
        <span>{formatDate(forecast.date, locale)}</span>
        <Icon size={21} aria-hidden="true" />
      </div>
      <strong>{weather("temperatureRange", { max: Math.round(forecast.maxTemperature), min: Math.round(forecast.minTemperature) })}</strong>
      <p>{weather(`conditions.${forecast.conditionKey}`)}</p>
      <dl className={styles.forecastMeta}>
        <div>
          <dt>
            <Droplets size={14} aria-hidden="true" />
            {weather("rain")}
          </dt>
          <dd>{weather("percentValue", { value: Math.round(forecast.rainProbability) })}</dd>
        </div>
        <div>
          <dt>
            <Sunrise size={14} aria-hidden="true" />
            {weather("sunrise")}
          </dt>
          <dd>{formatTime(forecast.sunrise, locale)}</dd>
        </div>
        <div>
          <dt>
            <Moon size={14} aria-hidden="true" />
            {weather("sunset")}
          </dt>
          <dd>{formatTime(forecast.sunset, locale)}</dd>
        </div>
      </dl>
    </article>
  );
}

