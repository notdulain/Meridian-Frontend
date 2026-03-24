import axios from "axios";
import { getStoredAccessToken } from "@/src/lib/auth/session";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
  // Keep runtime explicit so missing env is caught early in non-local environments.
  // Local fallback keeps developer experience smooth.
  console.warn("NEXT_PUBLIC_API_BASE_URL is not set. Falling back to http://localhost:5050");
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
  const token = getStoredAccessToken();
  if (token && !isAuthCall) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.info("[api:request]", config.method?.toUpperCase(), `${config.baseURL ?? ""}${url}`);
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    console.info("[api:response]", response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url;
    console.warn("[api:error]", status ?? "unknown", url);

    return Promise.reject(error);
  },
);

export default apiClient;
