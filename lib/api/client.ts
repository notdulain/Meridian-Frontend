/**
 * Meridian API Client
 * Typed fetch wrapper — all calls go through the Ocelot API Gateway on port 5050.
 *
 * Usage:
 *   import { apiClient } from "@/lib/api/client";
 *   const delivery = await apiClient.get<DeliveryDto>("/delivery/api/Deliveries/2");
 */

const GATEWAY_BASE_URL =
    process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:5050";

class ApiError extends Error {
    constructor(
        public status: number,
        public statusText: string,
        message?: string
    ) {
        super(message ?? `API error ${status}: ${statusText}`);
        this.name = "ApiError";
    }
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    // Retrieve token from storage — replace with auth context in production
    const token =
        typeof window !== "undefined" ? localStorage.getItem("meridian_token") : null;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) ?? {}),
    };

    const res = await fetch(`${GATEWAY_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const body = await res.text();
        throw new ApiError(res.status, res.statusText, body);
    }

    // 204 No Content
    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
}

export const apiClient = {
    get: <T>(path: string) => request<T>(path, { method: "GET" }),
    post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body: JSON.stringify(body) }),
    put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
    patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
    delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

export { ApiError };
