import type { PaginatedResponse } from "@/types/pagination";

import type { User, UserDto, UsersApiPage } from "../types/user.types";
import { getRoleLabel } from "../utils/role-labels";

export function mapUserDtoToUi(dto: UserDto): User {
  const roleName = dto.membership?.role.name ?? "";
  return {
    id: dto.id,
    email: dto.email,
    firstName: dto.firstName,
    lastName: dto.lastName,
    fullName: `${dto.firstName} ${dto.lastName}`.trim(),
    roleName,
    roleLabel: getRoleLabel(roleName),
    isActive: dto.isActive,
    lastLoginAt: dto.lastLoginAt,
  };
}

export function mapUsersPageToUi(
  response: UsersApiPage,
): PaginatedResponse<User> {
  return {
    items: response.items.map(mapUserDtoToUi),
    meta: {
      page: response.meta.page,
      take: response.meta.limit,
      total: response.meta.total,
      totalPages: response.meta.totalPages,
    },
  };
}
