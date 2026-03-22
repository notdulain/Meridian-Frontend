import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  // Keep runtime explicit so missing env is caught early in non-local environments.
  // Local fallback keeps developer experience smooth.
  console.warn("NEXT_PUBLIC_API_URL is not set. Falling back to http://localhost:5050");
}

const apiClient = axios.create({
  baseURL: baseURL || "http://localhost:5050",
  headers: {
    "Content-Type": "application/json",
  },
});

const AUTH_BYPASS_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/auth/revoke",
  "/api/auth/logout",
];

apiClient.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  const url = config.url || "";
  const isAuthCall = AUTH_BYPASS_PATHS.some((path) => url.startsWith(path));
  const token = localStorage.getItem("meridian_token");
  if (token && !isAuthCall) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
