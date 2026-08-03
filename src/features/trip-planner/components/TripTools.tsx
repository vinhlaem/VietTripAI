"use client";

import { CalendarPlus, Check, Heart, Printer, ThumbsDown, ThumbsUp } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import type { GeneratedItinerary } from "@/features/planner/types";
import type { NormalizedWeather } from "@/features/weather/types";
import styles from "./TripPlanner.module.scss";

type Props = { guests?: number; startDate?: string; trip: GeneratedItinerary; weather: NormalizedWeather | null; };

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = name; anchor.click();
  URL.revokeObjectURL(url);
}

export function TripTools({ guests = 1, startDate, trip, weather }: Props) {
  const t = useTranslations("TripTools");
  const locale = useLocale();
  const [checked, setChecked] = useState<string[]>([]);
  const [favorite, setFavorite] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const packing = useMemo(() => {
    const values = [t("packing.identification"), t("packing.charger"), t("packing.water")];
    if (weather?.forecast.some((day) => day.rainProbability >= 40)) values.push(t("packing.rain"));
    if (trip.interests.some((interest) => interest.includes("beach"))) values.push(t("packing.beach"));
    if (trip.interests.some((interest) => interest.includes("nature") || interest.includes("photography"))) values.push(t("packing.outdoor"));
    return values;
  }, [t, trip.interests, weather]);
  const perPerson = Math.round(trip.estimatedCost.total / Math.max(1, guests));
  const hotelBudget = Math.round(trip.budget * (trip.preferences?.hotelBudgetPercent ?? 35) / 100);

  function exportCalendar() {
    const events = trip.dailyPlans.flatMap((day) => day.activities.map((activity) => [
      "BEGIN:VEVENT", "UID:" + activity.id + "@viettrip.ai", ...((startDate && activity.startTime) ? ["DTSTART:" + new Date(new Date(startDate + "T00:00:00").getTime() + (day.day - 1) * 86400000).toISOString().slice(0, 10).replace(/-/g, "") + "T" + activity.startTime.replace(":", "") + "00"] : []), "SUMMARY:" + (activity.placeName ?? activity.title),
      "DESCRIPTION:" + activity.description.replace(/\n/g, " "), "END:VEVENT",
    ].join("\r\n")));
    download("viettrip-itinerary.ics", ["BEGIN:VCALENDAR", "VERSION:2.0", ...events, "END:VCALENDAR"].join("\r\n"), "text/calendar");
  }

  return (
    <section className={styles.tripTools}>
      <div className={styles.toolHeader}><div><h2>{t("title")}</h2><p>{t("perPerson", { value: new Intl.NumberFormat(locale).format(perPerson) })} · {t("hotelBudget", { value: new Intl.NumberFormat(locale).format(hotelBudget) })}</p></div>
        <div className={styles.toolActions}>
          <button type="button" aria-pressed={favorite} onClick={() => setFavorite((value) => { const next = !value; localStorage.setItem("viettrip:favourite:" + trip.destination, String(next)); return next; })}><Heart fill={favorite ? "currentColor" : "none"} size={17} />{t("favorite")}</button>
          <button type="button" onClick={exportCalendar}><CalendarPlus size={17} />{t("calendar")}</button>
          <button type="button" onClick={() => window.print()}><Printer size={17} />{t("print")}</button>
        </div>
      </div>
      <div className={styles.toolGrid}>
        <div><h3>{t("packingTitle")}</h3>{packing.map((item) => <label className={styles.checkItem} key={item}><input type="checkbox" checked={checked.includes(item)} onChange={() => setChecked((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item])} /><Check size={15} />{item}</label>)}</div>
        <div><h3>{t("feedbackTitle")}</h3><p>{t("feedbackDescription")}</p><div className={styles.feedbackButtons}><button type="button" aria-pressed={feedback === "up"} onClick={() => { setFeedback("up"); localStorage.setItem("viettrip:feedback:" + trip.destination, "up"); localStorage.setItem("viettrip:preferred-interests", JSON.stringify(trip.interests)); }}><ThumbsUp size={17} />{t("useful")}</button><button type="button" aria-pressed={feedback === "down"} onClick={() => { setFeedback("down"); localStorage.setItem("viettrip:feedback:" + trip.destination, "down"); }}><ThumbsDown size={17} />{t("notUseful")}</button></div></div>
      </div>
    </section>
  );
}