import { API } from "@/src/api/definitions";
import type { AuthTokens } from "@/src/api/types/dtos";
import type { LoginRequestDto, RefreshTokenRequestDto, RegisterRequestDto } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

export const authService = {
  register: (payload: RegisterRequestDto) => apiRequest<AuthTokens, RegisterRequestDto>(API.auth.register, { data: payload }),
  login: (payload: LoginRequestDto) => apiRequest<AuthTokens, LoginRequestDto>(API.auth.login, { data: payload }),
  refresh: (payload: RefreshTokenRequestDto) => apiRequest<AuthTokens, RefreshTokenRequestDto>(API.auth.refresh, { data: payload }),
  revoke: (payload: RefreshTokenRequestDto) => apiRequest<void, RefreshTokenRequestDto>(API.auth.revoke, { data: payload }),
  logout: () => apiRequest<void>(API.auth.logout),
};
