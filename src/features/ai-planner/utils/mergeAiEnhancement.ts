import type { GeneratedItinerary } from "@/features/planner/types";
import type { AiItineraryEnhancement } from "../types";

export function mergeAiEnhancement(
  baseItinerary: GeneratedItinerary,
  enhancement: AiItineraryEnhancement,
): GeneratedItinerary {
  const dayEnhancementMap = new Map(
    enhancement.dayEnhancements.map((dayEnhancement) => [
      dayEnhancement.day,
      dayEnhancement,
    ]),
  );

  return {
    ...baseItinerary,
    summary: enhancement.tripSummary,
    summaryKey: undefined,
    tips: enhancement.tripTips,
    dailyPlans: baseItinerary.dailyPlans.map((dayPlan) => {
      const dayEnhancement = dayEnhancementMap.get(dayPlan.day);

      if (!dayEnhancement) {
        return dayPlan;
      }

      const activityEnhancementMap = new Map(
        dayEnhancement.activityEnhancements.map((activityEnhancement) => [
          activityEnhancement.activityId,
          activityEnhancement,
        ]),
      );

      return {
        ...dayPlan,
        title: dayEnhancement.dayTitle ?? dayPlan.title,
        titleKey: dayEnhancement.dayTitle ? undefined : dayPlan.titleKey,
        daySummary: dayEnhancement.daySummary ?? dayPlan.daySummary,
        weatherTip: dayEnhancement.weatherTip ?? dayPlan.weatherTip,
        activities: dayPlan.activities.map((activity) => {
          const activityEnhancement = activityEnhancementMap.get(activity.id);

          if (!activityEnhancement) {
            return activity;
          }

          return {
            ...activity,
            title: activityEnhancement.title ?? activity.title,
            titleKey: activityEnhancement.title ? undefined : activity.titleKey,
            description: activityEnhancement.description ?? activity.description,
            descriptionKey: activityEnhancement.description
              ? undefined
              : activity.descriptionKey,
            localTip: activityEnhancement.localTip ?? activity.localTip,
          };
        }),
      };
    }),
    plannerContext: `${baseItinerary.plannerContext}\nAI enhanced: true`,
  };
}
