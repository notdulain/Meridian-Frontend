import { API } from "@/src/api/definitions";
import type { RoleDto, UserDto } from "@/src/api/types/dtos";
import { apiRequest } from "@/src/api/utils/request";

export const userService = {
  list: () => apiRequest<UserDto[]>(API.users.list),
  byId: (id: string) => apiRequest<UserDto>(API.users.byId, { params: { id } }),
  me: () => apiRequest<UserDto>(API.users.me),
  update: (id: string, payload: Partial<UserDto>) =>
    apiRequest<UserDto, Partial<UserDto>>(API.users.update, { params: { id }, data: payload }),
  delete: (id: string) => apiRequest<void>(API.users.delete, { params: { id } }),
};

export const roleService = {
  list: () => apiRequest<RoleDto[]>(API.roles.list),
  me: () => apiRequest<RoleDto[]>(API.roles.me),
};
