import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { interestIcons, interests } from "../data/mockTrip";
import type { Interest } from "../types";
import styles from "./TripPlanner.module.scss";

type InterestChipsProps = {
  selected: Interest[];
  onChange: (nextInterests: Interest[]) => void;
};

export function InterestChips({ selected, onChange }: InterestChipsProps) {
  const interestsT = useTranslations("Interests");

  function toggleInterest(interest: Interest) {
    if (selected.includes(interest)) {
      onChange(selected.filter((item) => item !== interest));
      return;
    }

    onChange([...selected, interest]);
  }

  return (
    <div className={styles.chipGrid} role="group" aria-label={interestsT("ariaLabel")}>
      {interests.map((interest) => {
        const Icon = interestIcons[interest];
        const isSelected = selected.includes(interest);

        return (
          <button
            className={`${styles.chip} ${isSelected ? styles.chipActive : ""}`}
            key={interest}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggleInterest(interest)}
          >
            {isSelected ? (
              <Check size={16} aria-hidden="true" />
            ) : (
              <Icon size={16} aria-hidden="true" />
            )}
            {interestsT(interest)}
          </button>
        );
      })}
    </div>
  );
}
