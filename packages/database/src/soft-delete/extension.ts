import { Prisma } from "../generated/prisma/client.js";
import { isSoftDeleteModel } from "./config.js";
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

type ModelExtensionContext = {
  $name?: string;
  update: (args: Record<string, unknown>) => Promise<unknown>;
  updateMany: (args: Record<string, unknown>) => Promise<unknown>;
};

function getModelContext<T>(ctx: T): ModelExtensionContext {
  return Prisma.getExtensionContext(ctx) as unknown as ModelExtensionContext;
}

function assertSoftDeleteModel(modelName: string | undefined): asserts modelName is string {
  if (!modelName || !isSoftDeleteModel(modelName)) {
    throw new Error(
      `softDelete no está disponible para el modelo: ${modelName ?? "desconocido"}`,
    );
  }
}

/**
 * Extensión de soft delete:
 * - Query: filtra `deletedAt: null` en lecturas y updates.
 * - Model: `softDelete` / `softDeleteMany` (compatibles con transacciones interactivas).
 *
 * No interceptar `delete` / `deleteMany` en query extensions: dentro de `$transaction`
 * el delegado no es estable. Usar `tx.model.softDelete()` en su lugar.
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: "soft-delete",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !isSoftDeleteModel(model)) {
          return query(args);
        }

        if (
          READ_OPERATIONS.has(operation) ||
          WRITE_FILTER_OPERATIONS.has(operation)
        ) {
          return query(mergeNotDeleted(args as { where?: Record<string, unknown> }));
        }

        return query(args);
      },
    },
  },
  model: {
    $allModels: {
      async softDelete<T>(
        this: T,
        args: Omit<Prisma.Args<T, "update">, "data">,
      ) {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertSoftDeleteModel(modelName);

        return context.update({
          ...(args as Record<string, unknown>),
          data: softDeleteDataForModel(modelName),
        });
      },

      async softDeleteMany<T>(
        this: T,
        args: Omit<Prisma.Args<T, "updateMany">, "data">,
      ) {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertSoftDeleteModel(modelName);

        const typedArgs = args as { where?: Record<string, unknown> };

        return context.updateMany({
          ...typedArgs,
          where: mergeNotDeleted({ where: typedArgs.where }).where,
          data: softDeleteDataForModel(modelName),
        });
      },
    },
  },
});
