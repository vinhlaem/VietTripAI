import type { LucideIcon } from "lucide-react";

export type Destination = "Đà Nẵng" | "Hội An" | "Huế" | "Đà Lạt" | "Nha Trang";

export type Interest =
  | "Beach"
  | "Coffee"
  | "Local food"
  | "Culture"
  | "Nature"
  | "Photography"
  | "Night market"
  | "Family friendly";

export type PlannerFormValues = {
  province: string;
  touristAreaId: string;
  days: number | "";
  budget: string;
  interests: Interest[];
};

export type DayPlan = {
  day: number;
  title: string;
  summary: string;
  activities: string[];
};

export type CostItem = {
  label: string;
  amount: string;
  icon: LucideIcon;
};

export type MockTrip = {
  destination: Destination;
  days: number;
  budget: string;
  itinerary: DayPlan[];
  costs: {
    items: CostItem[];
    total: string;
  };
};

