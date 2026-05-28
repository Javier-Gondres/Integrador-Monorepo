import { Prisma } from "../generated/prisma/client.js";
import { isSoftDeleteModel, type SoftDeleteModel } from "./config.js";
import { mergeNotDeleted, softDeleteDataForModel } from "./helpers.js";

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

const WRITE_FILTER_OPERATIONS = new Set(["update", "updateMany", "upsert"]);

type ModelExtensionContext = {
  $name?: string;
  update: <A>(args: A) => Promise<unknown>;
  updateMany: <A>(args: A) => Promise<unknown>;
};

function getModelContext<T>(ctx: T): ModelExtensionContext {
  return Prisma.getExtensionContext(ctx) as unknown as ModelExtensionContext;
}

function assertSoftDeleteModel(
  modelName: string | undefined,
): asserts modelName is SoftDeleteModel {
  if (!modelName || !isSoftDeleteModel(modelName)) {
    throw new Error(
      `softDelete no está disponible para el modelo: ${modelName ?? "desconocido"}`,
    );
  }
}

function physicalDeleteDisabledError(model: string): Error {
  return new Error(
    `Los borrados físicos están deshabilitados para "${model}". Usa softDelete() o softDeleteMany().`,
  );
}

/**
 * Extensión de soft delete:
 * - Query: filtra `deletedAt: null` en lecturas/updates; bloquea `delete`/`deleteMany`.
 * - Model: `softDelete` / `softDeleteMany` (compatibles con transacciones interactivas).
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: "soft-delete",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !isSoftDeleteModel(model)) {
          return query(args);
        }

        if (operation === "delete" || operation === "deleteMany") {
          throw physicalDeleteDisabledError(model);
        }

        if (
          READ_OPERATIONS.has(operation) ||
          WRITE_FILTER_OPERATIONS.has(operation)
        ) {
          return query(
            mergeNotDeleted(args as { where?: Record<string, unknown> }),
          );
        }

        return query(args);
      },
    },
  },
  model: {
    $allModels: {
      async softDelete<T, A extends Omit<Prisma.Args<T, "update">, "data">>(
        this: T,
        args: A,
      ): Promise<Prisma.Result<T, A, "update">> {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertSoftDeleteModel(modelName);

        return context.update({
          ...args,
          data: softDeleteDataForModel(modelName),
        }) as Promise<Prisma.Result<T, A, "update">>;
      },

      async softDeleteMany<
        T,
        A extends Omit<Prisma.Args<T, "updateMany">, "data">,
      >(this: T, args: A): Promise<Prisma.BatchPayload> {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertSoftDeleteModel(modelName);

        const typedArgs = args as { where?: Record<string, unknown> };

        return context.updateMany({
          ...typedArgs,
          where: mergeNotDeleted({ where: typedArgs.where }).where,
          data: softDeleteDataForModel(modelName),
        }) as Promise<Prisma.BatchPayload>;
      },
    },
  },
});
