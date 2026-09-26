"use client";

import { useMemo } from "react";
import { useLocalStorage } from "./storage";

export type ByokKeys = { anthropic: string; openai: string; openrouter: string };
export const BYOK_STORAGE_KEY = "open-claude-design:keys";
const EMPTY: ByokKeys = { anthropic: "", openai: "", openrouter: "" };

/** BYOK keys live only in this browser's localStorage. */
export function useByok() {
  const [raw, setRaw] = useLocalStorage(BYOK_STORAGE_KEY);
  const keys = useMemo<ByokKeys>(() => {
    if (!raw) return EMPTY;
    try {
      return { ...EMPTY, ...(JSON.parse(raw) as Partial<ByokKeys>) };
    } catch {
      return EMPTY;
    }
  }, [raw]);
  const save = (n: ByokKeys) => setRaw(JSON.stringify(n));
  return { keys, save, hasKey: Boolean(keys.anthropic || keys.openai || keys.openrouter) };
}
