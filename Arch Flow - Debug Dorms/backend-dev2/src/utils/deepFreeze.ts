/**
 * Recursively freezes an object to ensure immutability.
 * Uses a WeakSet to handle circular references safely.
 */
export function deepFreeze<T extends object>(obj: T, seen = new WeakSet()): T {
  if (obj === null || typeof obj !== "object" || seen.has(obj)) {
    return obj;
  }

  seen.add(obj);

  Object.freeze(obj);

  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as any)[prop];
    if (
      value !== null &&
      (typeof value === "object" || typeof value === "function") &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value, seen);
    }
  });

  return obj;
}
