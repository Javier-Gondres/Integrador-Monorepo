export { type ExtendedPrismaClient, prisma } from "./client.js";
export * from "./generated/prisma/client.js";
export {
  isSoftDeleteModel,
  mergeNotDeleted,
  notDeleted,
  onlyDeleted,
  SOFT_DELETE_MODELS,
  SOFT_DELETE_MODELS_WITH_IS_ACTIVE,
  softDeleteData,
  softDeleteDataForModel,
  softDeleteExtension,
  type SoftDeleteModel,
  type SoftDeleteUpdateData,
  uniqueWithNotDeleted,
} from "./soft-delete/index.js";
