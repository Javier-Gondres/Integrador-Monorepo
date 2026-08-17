/* eslint-disable no-console */
/**
 * Backfill de secuencias NCF para empresas creadas antes de que la API las
 * provisionara automáticamente. Sin secuencia, `generateNcf` no encuentra de
 * dónde consumir consecutivos y las ventas quedan guardadas sin NCF.
 *
 * Idempotente: solo crea los tipos que le falten a cada empresa, nunca toca
 * las secuencias existentes (ni su `currentNumber`).
 *
 * Uso:
 *   pnpm db:backfill-ncf:dev
 */
import { prisma } from "../src/client.js";
import {
  buildDefaultNcfSequenceRows,
  DEFAULT_NCF_SEQUENCES,
} from "../src/ncf-defaults.js";

async function main(): Promise<void> {
  const companies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      ncfSequences: { select: { type: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  let createdTotal = 0;
  let companiesTouched = 0;

  for (const company of companies) {
    const existingTypes = new Set(
      company.ncfSequences.map((sequence) => sequence.type),
    );
    const missing = buildDefaultNcfSequenceRows(company.id).filter(
      (row) => !existingTypes.has(row.type),
    );

    if (missing.length === 0) {
      continue;
    }

    const { count } = await prisma.ncfSequence.createMany({
      data: missing,
      skipDuplicates: true,
    });

    createdTotal += count;
    companiesTouched += 1;
    console.log(
      `  ${company.name}: +${count} secuencia(s) [${missing
        .map((row) => row.prefix)
        .join(", ")}]`,
    );
  }

  console.log("Backfill de secuencias NCF completado:");
  console.log(`  empresas revisadas: ${companies.length}`);
  console.log(`  empresas actualizadas: ${companiesTouched}`);
  console.log(
    `  secuencias creadas: ${createdTotal} (tipos por defecto: ${DEFAULT_NCF_SEQUENCES.length})`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
