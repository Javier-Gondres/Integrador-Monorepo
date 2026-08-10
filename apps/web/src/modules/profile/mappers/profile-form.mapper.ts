import type { AuthUser } from "@/types";

import type { UpdateProfileSchema } from "../schemas/profile.schema";
import type { UpdateProfileData } from "../types/profile.types";

export function mapUserToPersonalInfoFormValues(
  user: AuthUser,
): UpdateProfileSchema {
  return {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
  };
}

export function mapPersonalInfoFormToDto(
  values: UpdateProfileSchema,
): UpdateProfileData {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
  };
}
