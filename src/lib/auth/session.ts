"use client";

const ACCESS_TOKEN_KEY = "meridian_token";
const ROLE_KEY = "meridian_role";
const USER_KEY = "meridian_user";

export function getStoredAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
}

export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const currentPath = `${window.location.pathname}${window.location.search}`;
  if (window.location.pathname !== "/login") {
    window.location.assign(`/login?redirect=${encodeURIComponent(currentPath)}`);
  }
}
