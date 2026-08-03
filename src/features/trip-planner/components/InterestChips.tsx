import { Camera, Check, Coffee, Landmark, Mountain, Sparkles, Ticket, Umbrella, Users, Utensils } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DynamicInterest } from "@/features/recommendations/types";
import { interestIcons } from "../data/mockTrip";
import type { Interest } from "../types";
import styles from "./TripPlanner.module.scss";

type InterestChipsProps = {
  selected: Interest[];
  onChange: (nextInterests: Interest[]) => void;
  options: DynamicInterest[];
};

export function InterestChips({ selected, onChange, options }: InterestChipsProps) {
  const interestsT = useTranslations("Interests");

  function toggleInterest(interest: Interest) {
    onChange(selected.includes(interest) ? selected.filter((item) => item !== interest) : [...selected, interest]);
  }

  return (
    <div className={styles.chipGrid} role="group" aria-label={interestsT("ariaLabel")}>
      {options.map((option) => {
        const text = `${option.id} ${option.label}`.toLocaleLowerCase("vi");
        const tag = /biển|beach|sea|đảo/.test(text) ? "beach" : /cà phê|coffee|cafe/.test(text) ? "coffee" : /ẩm thực|món ăn|food|cuisine|hải sản/.test(text) ? "local-food" : /văn hóa|di sản|culture|heritage|lịch sử/.test(text) ? "culture" : /thiên nhiên|nature|núi|cảnh quan/.test(text) ? "nature" : /ảnh|photo|check-in/.test(text) ? "photography" : /gia đình|family|trẻ em/.test(text) ? "family" : /chợ đêm|night market|giải trí|entertainment/.test(text) ? "entertainment" : option.id.startsWith("local:") ? option.id.split(":")[1] : option.id;
        const dynamicIcons = { beach: Umbrella, coffee: Coffee, "local-food": Utensils, culture: Landmark, nature: Mountain, photography: Camera, "night-market": Ticket, family: Users, entertainment: Ticket, sport: Mountain, spiritual: Landmark, shopping: Ticket, wellness: Sparkles, indoor: Landmark } as const;
        const Icon = interestIcons[option.id] ?? dynamicIcons[tag as keyof typeof dynamicIcons] ?? Sparkles;
        const isSelected = selected.includes(option.id);
        return (
          <button className={styles.chip + " " + (isSelected ? styles.chipActive : "")} key={option.id} type="button" aria-pressed={isSelected} onClick={() => toggleInterest(option.id)}>
            {isSelected ? <Check size={16} aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}