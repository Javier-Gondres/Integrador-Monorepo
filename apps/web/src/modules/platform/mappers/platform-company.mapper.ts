import type { PlatformCompanyFormSchema } from "../schemas/platform-company.schema";
import type {
  CreatePlatformCompanyPayload,
  PlatformCompaniesApiPage,
  PlatformCompany,
  PlatformCompanyDto,
} from "../types/platform.types";

export function mapPlatformCompanyDtoToUi(
  dto: PlatformCompanyDto,
): PlatformCompany {
  const ownerName = dto.owner
    ? `${dto.owner.firstName} ${dto.owner.lastName}`.trim()
    : null;

  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    rnc: dto.rnc,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    ownerEmail: dto.owner?.email ?? null,
    ownerName,
  };
}

export function mapPlatformCompaniesPageToUi(
  response: PlatformCompaniesApiPage,
) {
  return {
    items: response.items.map(mapPlatformCompanyDtoToUi),
    meta: response.meta,
  };
}

export function mapPlatformCompanyFormToPayload(
  values: PlatformCompanyFormSchema,
): CreatePlatformCompanyPayload {
  return {
    name: values.name.trim(),
    ...(values.rnc?.trim() && { rnc: values.rnc.trim() }),
    owner: {
      email: values.ownerEmail.trim(),
      password: values.ownerPassword,
      firstName: values.ownerFirstName.trim(),
      lastName: values.ownerLastName.trim(),
    },
  };
}

export function mapPlatformCompanyFormDefaults(): PlatformCompanyFormSchema {
  return {
    name: "",
    rnc: "",
    ownerEmail: "",
    ownerPassword: "",
    ownerFirstName: "",
    ownerLastName: "",
  };
}
