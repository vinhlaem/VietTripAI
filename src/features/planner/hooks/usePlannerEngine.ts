"use client";

import { useCallback } from "react";
import { generateItinerary } from "../engine/planner.engine";
import type { PlannerEngineInput } from "../types";

export function usePlannerEngine() {
  return useCallback((input: PlannerEngineInput) => generateItinerary(input), []);
}
