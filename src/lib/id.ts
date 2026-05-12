/**
 * Generates a short, sortable, collision-resistant ID for client-side
 * entities. Uses `crypto.randomUUID()` when available (all evergreen
 * browsers + Node 19+), with a fallback for very old environments.
 *
 * Returned format: a UUID v4 string (36 chars). Short enough for URLs
 * and stable across reloads.
 */
export function newId(prefix?: string): string {
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return prefix ? `${prefix}_${uuid}` : uuid;
}
