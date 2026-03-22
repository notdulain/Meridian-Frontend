import type { LoginRequest, RegisterRequest, AuthResponse } from "@/lib/types";
import api from "./api";

export const authService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>("/api/auth/login", {
            email: credentials.email,
            password: credentials.password,
        });
        return data;
    },
    register: async (payload: RegisterRequest): Promise<AuthResponse | null> => {
        const { data } = await api.post<AuthResponse | null>("/api/auth/register", {
            fullName: payload.fullName,
            email: payload.email,
            password: payload.password,
            role: payload.role,
        });
        return data ?? null;
    },
};
