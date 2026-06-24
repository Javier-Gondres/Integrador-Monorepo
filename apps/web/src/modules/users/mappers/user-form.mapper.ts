import type {
  UserFormSchema,
  UserUpdateFormSchema,
} from "../schemas/user.schema";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "../types/user.types";

export function mapUserToCreateFormValues(): UserFormSchema {
  return {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "",
  };
}

export function mapUserToUpdateFormValues(user: User): UserUpdateFormSchema {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.roleName,
  };
}

export function mapCreateFormValuesToDto(
  values: UserFormSchema,
): CreateUserPayload {
  return {
    email: values.email.trim(),
    password: values.password,
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    role: values.role,
  };
}

export function mapUpdateFormValuesToDto(
  values: UserUpdateFormSchema,
): UpdateUserPayload {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    role: values.role,
  };
}
