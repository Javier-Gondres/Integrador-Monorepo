import { Prisma } from "../generated/prisma/client.js";
import {
  isSoftDeleteModel,
  type SoftDeleteModel,
  softDeleteSetsIsActive,
} from "./config.js";
import { isIncludingDeleted, runWithDeleted } from "./context.js";
import {
  activateDataForModel,
  deactivateDataForModel,
  mergeNotDeleted,
  mergeOnlyDeleted,
  restoreDataForModel,
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
      `Operación no disponible para el modelo: ${modelName ?? "desconocido"}`,
    );
  }
}

function assertModelHasIsActive(
  modelName: string | undefined,
): asserts modelName is SoftDeleteModel {
  assertSoftDeleteModel(modelName);
  if (!softDeleteSetsIsActive(modelName)) {
    throw new Error(
      `activate/deactivate no está disponible para el modelo: ${modelName}`,
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
 * - Query: filtra `deletedAt: null`; bloquea `delete`/`deleteMany`; respeta `withDeleted`.
 * - Client: `withDeleted(fn)` para consultas incluyendo eliminados.
 * - Model: ciclo de vida (softDelete, restore, activate, deactivate, withDeleted).
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: "soft-delete",
  client: {
    withDeleted<R>(fn: () => Promise<R>): Promise<R> {
      return Promise.resolve(runWithDeleted(fn));
    },
  },
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (!model || !isSoftDeleteModel(model)) {
          return query(args);
        }

        if (operation === "delete" || operation === "deleteMany") {
          throw physicalDeleteDisabledError(model);
        }

        if (isIncludingDeleted()) {
          return query(args);
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

      async restore<T, A extends Omit<Prisma.Args<T, "update">, "data">>(
        this: T,
        args: A,
      ): Promise<Prisma.Result<T, A, "update">> {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertSoftDeleteModel(modelName);

        return runWithDeleted(async () =>
          context.update({
            ...args,
            data: restoreDataForModel(modelName),
          }),
        ) as Promise<Prisma.Result<T, A, "update">>;
      },

      async restoreMany<
        T,
        A extends Omit<Prisma.Args<T, "updateMany">, "data">,
      >(this: T, args: A): Promise<Prisma.BatchPayload> {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertSoftDeleteModel(modelName);

        const typedArgs = args as { where?: Record<string, unknown> };

        return runWithDeleted(async () =>
          context.updateMany({
            ...typedArgs,
            where: mergeOnlyDeleted({ where: typedArgs.where }).where,
            data: restoreDataForModel(modelName),
          }),
        ) as Promise<Prisma.BatchPayload>;
      },

      async activate<T, A extends Omit<Prisma.Args<T, "update">, "data">>(
        this: T,
        args: A,
      ): Promise<Prisma.Result<T, A, "update">> {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertModelHasIsActive(modelName);

        return context.update({
          ...args,
          data: activateDataForModel(modelName),
        }) as Promise<Prisma.Result<T, A, "update">>;
      },

      async activateMany<
        T,
        A extends Omit<Prisma.Args<T, "updateMany">, "data">,
      >(this: T, args: A): Promise<Prisma.BatchPayload> {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertModelHasIsActive(modelName);

        const typedArgs = args as { where?: Record<string, unknown> };

        return context.updateMany({
          ...typedArgs,
          where: mergeNotDeleted({ where: typedArgs.where }).where,
          data: activateDataForModel(modelName),
        }) as Promise<Prisma.BatchPayload>;
      },

      async deactivate<T, A extends Omit<Prisma.Args<T, "update">, "data">>(
        this: T,
        args: A,
      ): Promise<Prisma.Result<T, A, "update">> {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertModelHasIsActive(modelName);

        return context.update({
          ...args,
          data: deactivateDataForModel(modelName),
        }) as Promise<Prisma.Result<T, A, "update">>;
      },

      async deactivateMany<
        T,
        A extends Omit<Prisma.Args<T, "updateMany">, "data">,
      >(this: T, args: A): Promise<Prisma.BatchPayload> {
        const context = getModelContext(this);
        const modelName = context.$name;
        assertModelHasIsActive(modelName);

        const typedArgs = args as { where?: Record<string, unknown> };

        return context.updateMany({
          ...typedArgs,
          where: mergeNotDeleted({ where: typedArgs.where }).where,
          data: deactivateDataForModel(modelName),
        }) as Promise<Prisma.BatchPayload>;
      },

      withDeleted<T, R>(this: T, fn: (model: T) => Promise<R>): Promise<R> {
        const modelName = getModelContext(this).$name;
        assertSoftDeleteModel(modelName);
        return Promise.resolve(runWithDeleted(() => fn(this)));
      },
    },
  },
});
