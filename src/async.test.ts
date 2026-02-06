import { describe, it, expect, vi } from "vitest";
import { retry, mapWithConcurrency, debounce } from "./async.js";

describe("Async utilities", () => {
  describe("retry", () => {
    it("returns ok on first successful attempt", async () => {
      const fn = vi.fn().mockResolvedValue("done");
      const result = await retry(fn, { maxAttempts: 3, delayMs: 0 });

      expect(result).toEqual({ ok: true, value: "done" });
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("retries on failure and eventually succeeds", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("fail1"))
        .mockRejectedValueOnce(new Error("fail2"))
        .mockResolvedValue("done");

      const result = await retry(fn, { maxAttempts: 3, delayMs: 0 });

      expect(result).toEqual({ ok: true, value: "done" });
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("returns err after all attempts exhausted", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("always fails"));
      const result = await retry(fn, { maxAttempts: 2, delayMs: 0 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe("always fails");
      }
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("handles non-Error throws", async () => {
      const fn = vi.fn().mockRejectedValue("string error");
      const result = await retry(fn, { maxAttempts: 1, delayMs: 0 });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe("string error");
      }
    });
  });

  describe("mapWithConcurrency", () => {
    it("processes all items", async () => {
      const items = [1, 2, 3, 4, 5];
      const results = await mapWithConcurrency(items, 2, async (item) => {
        return item * 2;
      });

      expect(results).toEqual([2, 4, 6, 8, 10]);
    });

    it("respects concurrency limit", async () => {
      let active = 0;
      let maxActive = 0;

      const items = [1, 2, 3, 4, 5, 6];
      await mapWithConcurrency(items, 2, async () => {
        active++;
        maxActive = Math.max(maxActive, active);
        await new Promise((r) => setTimeout(r, 10));
        active--;
      });

      expect(maxActive).toBeLessThanOrEqual(2);
    });

    it("preserves order", async () => {
      const items = [30, 10, 20];
      const results = await mapWithConcurrency(items, 3, async (item) => {
        await new Promise((r) => setTimeout(r, item));
        return item;
      });

      expect(results).toEqual([30, 10, 20]);
    });

    it("handles empty array", async () => {
      const results = await mapWithConcurrency([], 5, async () => 1);
      expect(results).toEqual([]);
    });

    it("throws on non-positive concurrency", async () => {
      await expect(
        mapWithConcurrency([1], 0, async (x) => x),
      ).rejects.toThrow("Concurrency must be positive");
    });
  });

  describe("debounce", () => {
    it("delays execution", async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it("resets timer on subsequent calls", async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);

      vi.useRealTimers();
    });

    it("passes arguments to the original function", async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced("a", "b");
      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledWith("a", "b");

      vi.useRealTimers();
    });
  });
});
