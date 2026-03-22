import { getStoredAccessToken } from "@/src/lib/auth/session";

/**
 * Meridian API Client
 * Typed fetch wrapper - all calls go through the Ocelot API Gateway on port 5050.
 *
 * Usage:
 *   import { apiClient } from "@/lib/api/client";
 *   const delivery = await apiClient.get<DeliveryDto>("/delivery/api/deliveries/2");
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
    const token = getStoredAccessToken();

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...((options.headers as Record<string, string>) ?? {}),
    };

    console.info("[fetch:request]", options.method ?? "GET", `${GATEWAY_BASE_URL}${path}`);

    const res = await fetch(`${GATEWAY_BASE_URL}${path}`, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const body = await res.text();
        console.warn("[fetch:error]", res.status, path, body);
        throw new ApiError(res.status, res.statusText, body);
    }

    console.info("[fetch:response]", res.status, path);

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
