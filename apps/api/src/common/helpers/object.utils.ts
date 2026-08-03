/**
 * Retorna una copia del objeto sin propiedades con valor `undefined`.
 * Es util para construir payloads parciales (PATCH) evitando sobreescribir
 * campos por omision en operaciones de persistencia.
 */
export function getDefinedData<T>(data: Partial<T>): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
