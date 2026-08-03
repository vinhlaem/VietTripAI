import type { LucideIcon } from "lucide-react";

export type Destination = "Đà Nẵng" | "Hội An" | "Huế" | "Đà Lạt" | "Nha Trang";

export type Interest = string;

export type PlannerFormValues = {
  province: string;
  touristAreaId: string;
  days: number | "";
  budget: string;
  interests: Interest[];
  checkIn: string;
  checkOut: string;
  guests: number;
  travelParty: "solo" | "couple" | "family" | "friends";
  pace: "relaxed" | "balanced" | "active";
  accessibility: "standard" | "limitedMobility";
  indoorPreference: boolean;
  hotelBudgetPercent: number;
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

