/**
 * Async utilities for controlled concurrency and retry logic.
 */

import { type Result, ok, err } from "./result.js";

export type RetryOptions = {
  maxAttempts: number;
  delayMs: number;
  backoffMultiplier?: number;
};

/** Retry an async operation with configurable backoff. */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<Result<T, Error>> {
  let lastError: Error = new Error("No attempts made");
  let delay = options.delayMs;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      const value = await fn();
      return ok(value);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
      if (attempt < options.maxAttempts) {
        await sleep(delay);
        delay *= options.backoffMultiplier ?? 1;
      }
    }
  }

  return err(lastError);
}

/** Process items with a concurrency limit. */
export async function mapWithConcurrency<T, U>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
  if (concurrency <= 0) {
    throw new Error("Concurrency must be positive");
  }

  const results: U[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      const item = items[index];
      if (item !== undefined) {
        results[index] = await fn(item, index);
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);

  return results;
}

/** Create a debounced version of a function. */
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined;
      fn(...args);
    }, delayMs);
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
