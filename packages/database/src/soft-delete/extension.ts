import { Prisma } from "../generated/prisma/client.js";
import {
  isSoftDeleteModel,
  modelToDelegate,
} from "./config.js";
import {
  mergeNotDeleted,
  softDeleteDataForModel,
} from "./helpers.js";

const READ_OPERATIONS = new Set([
  "findMany",
  "findFirst",
  "findUnique",
  "findFirstOrThrow",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
]);

const WRITE_FILTER_OPERATIONS = new Set([
  "update",
  "updateMany",
  "upsert",
]);

type QueryArgs = Record<string, unknown> & { where?: Record<string, unknown> };

function getExtensionDelegate(
  context: unknown,
  model: string,
): {
  update: (args: QueryArgs) => Promise<unknown>;
  updateMany: (args: QueryArgs) => Promise<unknown>;
} {
  const delegateKey = modelToDelegate(model);
  const delegate = (context as Record<string, unknown>)[delegateKey];
  if (
    !delegate ||
    typeof delegate !== "object" ||
    !("update" in delegate) ||
    !("updateMany" in delegate)
  ) {
    throw new Error(`Delegado Prisma no encontrado para el modelo: ${model}`);
  }
  return delegate as {
    update: (args: QueryArgs) => Promise<unknown>;
    updateMany: (args: QueryArgs) => Promise<unknown>;
  };
}

/**
 * Extensión de Prisma Client: filtra `deletedAt: null` en lecturas/updates y
 * convierte `delete` / `deleteMany` en actualizaciones con `deletedAt` (+ `isActive` si aplica).
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: "soft-delete",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!isSoftDeleteModel(model)) {
          return query(args);
        }

        const typedArgs = args as QueryArgs;

        if (READ_OPERATIONS.has(operation)) {
          return query(mergeNotDeleted(typedArgs));
        }

        if (WRITE_FILTER_OPERATIONS.has(operation)) {
          return query(mergeNotDeleted(typedArgs));
        }

        if (operation === "delete") {
          const delegate = getExtensionDelegate(this, model);
          return delegate.update({
            where: typedArgs.where,
            data: softDeleteDataForModel(model),
          });
        }

        if (operation === "deleteMany") {
          const delegate = getExtensionDelegate(this, model);
          return delegate.updateMany({
            where: {
              ...(typedArgs.where ?? {}),
              deletedAt: null,
            },
            data: softDeleteDataForModel(model),
          });
        }

        return query(args);
      },
    },
  },
});
