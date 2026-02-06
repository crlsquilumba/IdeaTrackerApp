/**
 * Type-safe collection utilities that reduce boilerplate for common operations.
 */

/** Group array items by a key-extracting function. */
export function groupBy<T>(
  items: readonly T[],
  keyFn: (item: T) => string,
): Record<string, T[]> {
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    const group = result[key];
    if (group) {
      group.push(item);
    } else {
      result[key] = [item];
    }
  }
  return result;
}

/** Create a lookup map from an array using a key-extracting function. */
export function keyBy<T>(
  items: readonly T[],
  keyFn: (item: T) => string,
): Record<string, T> {
  const result: Record<string, T> = {};
  for (const item of items) {
    result[keyFn(item)] = item;
  }
  return result;
}

/** Deduplicate array items by an optional key function. */
export function uniqueBy<T>(
  items: readonly T[],
  keyFn: (item: T) => unknown = (item) => item,
): T[] {
  const seen = new Set<unknown>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }
  return result;
}

/** Partition an array into two groups based on a predicate. */
export function partition<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
): [T[], T[]] {
  const pass: T[] = [];
  const fail: T[] = [];
  for (const item of items) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }
  return [pass, fail];
}

/** Chunk an array into groups of a specified size. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size <= 0) {
    throw new Error("Chunk size must be positive");
  }
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

/** Safely pick specified keys from an object. */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/** Omit specified keys from an object. */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, K> {
  const keySet = new Set<string | number | symbol>(keys);
  const result = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (!keySet.has(key)) {
      result[key] = value;
    }
  }
  return result as Omit<T, K>;
}
