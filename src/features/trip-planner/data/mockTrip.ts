import {
  Camera,
  Coffee,
  Landmark,
  Mountain,
  Salad,
  ShipWheel,
  Ticket,
  Umbrella,
  Utensils,
} from "lucide-react";
import type { Destination, Interest, MockTrip } from "../types";

export const destinations: Destination[] = [
  "Đà Nẵng",
  "Hội An",
  "Huế",
  "Đà Lạt",
  "Nha Trang",
];

export const dayOptions = [2, 3, 4, 5];

export const budgetOptions = [
  "2,000,000 VND",
  "5,000,000 VND",
  "8,000,000 VND",
  "12,000,000 VND",
];

export const interests: Interest[] = [
  "Beach",
  "Coffee",
  "Local food",
  "Culture",
  "Nature",
  "Photography",
  "Night market",
  "Family friendly",
];

export const mockTrip: MockTrip = {
  destination: "Đà Nẵng",
  days: 3,
  budget: "5,000,000 VND",
  itinerary: [
    {
      day: 1,
      title: "Beach arrival and city lights",
      summary: "Ease into Đà Nẵng with coastal air, local flavor, and sunset views.",
      activities: [
        "Mỹ Khê Beach",
        "Local Mì Quảng",
        "Sơn Trà Peninsula",
        "Dragon Bridge",
      ],
    },
    {
      day: 2,
      title: "Mountain views and riverside coffee",
      summary: "Spend the day above the clouds, then come back for a slower evening.",
      activities: ["Bà Nà Hills", "Golden Bridge", "Han River Coffee"],
    },
    {
      day: 3,
      title: "Heritage corners and market browsing",
      summary: "Wrap with caves, seafood, local shopping, and an easy riverside walk.",
      activities: ["Marble Mountains", "Seafood Lunch", "Han Market", "Riverside Walk"],
    },
  ],
  costs: {
    items: [
      { label: "Food", amount: "1,450,000 VND", icon: Utensils },
      { label: "Transport", amount: "850,000 VND", icon: ShipWheel },
      { label: "Tickets", amount: "1,900,000 VND", icon: Ticket },
      { label: "Coffee", amount: "300,000 VND", icon: Coffee },
    ],
    total: "4,500,000 VND",
  },
};

export const interestIcons: Record<Interest, typeof Camera> = {
  Beach: Umbrella,
  Coffee,
  "Local food": Salad,
  Culture: Landmark,
  Nature: Mountain,
  Photography: Camera,
  "Night market": Ticket,
  "Family friendly": Landmark,
};


