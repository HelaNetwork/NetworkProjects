const STORAGE_PREFIX = "hela_match_";

export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    console.warn("localStorage write failed for key:", key);
  }
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_PREFIX + key);
}

export function clearAll(): void {
  if (typeof window === "undefined") return;
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith(STORAGE_PREFIX)
  );
  keys.forEach((k) => localStorage.removeItem(k));
}

export const STORAGE_KEYS = {
  PROFILE: "profile",
  IDENTITY: "identity",
  MATCHES: "matches",
  CHAT_PREFIX: "chat_",
  LIKED_PROFILES: "liked_profiles",
  PROFILES_CACHE: "profiles_cache",
  NOTIFICATIONS: "notifications",
  SWIPE_INDEX: "swipe_index",
} as const;
