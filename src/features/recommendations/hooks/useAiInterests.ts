/* eslint-disable react-hooks/set-state-in-effect -- Async request state is reset when the destination key changes. */
import { useEffect, useMemo, useState } from "react";
import type { AiInterestRequest, AiInterestResponse, DynamicInterest } from "../types";

const cache = new Map<string, DynamicInterest[]>();

export function useAiInterests(input: AiInterestRequest | null) {
  const key = useMemo(() => input ? JSON.stringify(input) : "", [input]);
  const [state, setState] = useState<{ key: string; interests: DynamicInterest[]; loading: boolean; failed: boolean }>({ key: "", interests: [], loading: false, failed: false });

  useEffect(() => {
    if (!input || !key) { setState({ key, interests: [], loading: false, failed: false }); return; }
    const cached = cache.get(key);
    if (cached) { setState({ key, interests: cached, loading: false, failed: false }); return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setState({ key, interests: [], loading: true, failed: false });
      try {
        const response = await fetch("/api/ai-planner/interests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: controller.signal });
        if (!response.ok) throw new Error("Unable to generate interests.");
        const result = await response.json() as AiInterestResponse;
        if (result.source !== "ai" || !Array.isArray(result.interests) || !result.interests.length) throw new Error("AI interests unavailable.");
        cache.set(key, result.interests);
        setState({ key, interests: result.interests, loading: false, failed: false });
      } catch (error) {
        if ((error as Error).name !== "AbortError") setState({ key, interests: [], loading: false, failed: true });
      }
    }, 450);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [input, key]);

  return state.key === key ? state : { key, interests: [], loading: Boolean(input), failed: false };
}