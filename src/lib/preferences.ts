"use client";

export const PREFERENCE_KEYS = {
  liveTrackingMapEnabled: "meridian_pref_live_tracking_map",
  desktopNotifications: "meridian_pref_desktop_notifications",
  compactTables: "meridian_pref_compact_tables",
  darkMode: "meridian_pref_dark_mode",
} as const;

export function getBooleanPreference(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  const value = localStorage.getItem(key);
  if (value === null) return fallback;
  return value === "true";
}

export function setBooleanPreference(key: string, value: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, String(value));
}
