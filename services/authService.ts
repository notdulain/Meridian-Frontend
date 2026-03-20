import type { LoginRequest, AuthResponse } from "@/lib/types";
import api from "./api";

export const authService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>("/api/auth/login", {
            email: credentials.email,
            pw: credentials.password,
        });
        return data;
    },
};
