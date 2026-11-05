/**
 * Stable conversion from WarEra ObjectIds to the numeric IDs Aegis uses.
 *
 * FNV-1a 32-bit, folded into 31 bits so the result stays a positive int32.
 * A process-local registry resolves the rare collision deterministically.
 */

const registry = new Map<string, number>();
const used = new Set<number>();

export function numericId(kind: string, warEraId: string): number {
  const key = `${kind}:${warEraId}`;
  const existing = registry.get(key);
  if (existing !== undefined) return existing;

  let hash = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    hash ^= key.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  let candidate = (hash >>> 1) || 1;
  while (used.has(candidate)) candidate = candidate >= 0x7ffffffe ? 1 : candidate + 1;

  used.add(candidate);
  registry.set(key, candidate);
  return candidate;
}

export function resetIdRegistry(): void {
  registry.clear();
  used.clear();
}
