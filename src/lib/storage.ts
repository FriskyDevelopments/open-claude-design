"use client";

import { useCallback, useSyncExternalStore } from "react";

const EVENT = "frisky-design:storage";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Write to localStorage and notify every useLocalStorage subscriber in this tab. */
export function writeLocal(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

/** SSR-safe localStorage value (null on the server and before hydration). */
export function useLocalStorage(key: string): [string | null, (v: string | null) => void] {
  const value = useSyncExternalStore(subscribe, () => read(key), () => null);
  const set = useCallback((v: string | null) => writeLocal(key, v), [key]);
  return [value, set];
}

/** Current `?name=` query value (null on the server). */
export function useQueryParam(name: string): string | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      try {
        return new URLSearchParams(window.location.search).get(name);
      } catch {
        return null;
      }
    },
    () => null,
  );
}

export function notifyStorage() {
  window.dispatchEvent(new Event(EVENT));
}
