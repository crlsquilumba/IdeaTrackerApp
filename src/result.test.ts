import { describe, it, expect } from "vitest";
import {
  ok,
  err,
  tryCatch,
  tryCatchAsync,
  mapResult,
  mapError,
  flatMap,
  unwrapOr,
  collectResults,
} from "./result.js";

describe("Result", () => {
  describe("ok / err", () => {
    it("creates a success result", () => {
      const result = ok(42);
      expect(result).toEqual({ ok: true, value: 42 });
    });

    it("creates a failure result", () => {
      const result = err("fail");
      expect(result).toEqual({ ok: false, error: "fail" });
    });
  });

  describe("tryCatch", () => {
    it("returns ok when function succeeds", () => {
      const result = tryCatch(() => JSON.parse('{"a": 1}'));
      expect(result).toEqual({ ok: true, value: { a: 1 } });
    });

    it("returns err when function throws", () => {
      const result = tryCatch(() => JSON.parse("invalid"));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it("wraps non-Error throws", () => {
      const result = tryCatch(() => {
        throw "string error";
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe("string error");
      }
    });
  });

  describe("tryCatchAsync", () => {
    it("returns ok for resolved promise", async () => {
      const result = await tryCatchAsync(() => Promise.resolve(10));
      expect(result).toEqual({ ok: true, value: 10 });
    });

    it("returns err for rejected promise", async () => {
      const result = await tryCatchAsync(() =>
        Promise.reject(new Error("async fail")),
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toBe("async fail");
      }
    });
  });

  describe("mapResult", () => {
    it("transforms the value of an ok result", () => {
      const result = mapResult(ok(5), (n) => n * 2);
      expect(result).toEqual({ ok: true, value: 10 });
    });

    it("passes through an err result unchanged", () => {
      const result = mapResult(err("bad"), (n: number) => n * 2);
      expect(result).toEqual({ ok: false, error: "bad" });
    });
  });

  describe("mapError", () => {
    it("transforms the error of an err result", () => {
      const result = mapError(err("bad"), (e) => `wrapped: ${e}`);
      expect(result).toEqual({ ok: false, error: "wrapped: bad" });
    });

    it("passes through an ok result unchanged", () => {
      const result = mapError(ok(5), (e: string) => `wrapped: ${e}`);
      expect(result).toEqual({ ok: true, value: 5 });
    });
  });

  describe("flatMap", () => {
    it("chains successful operations", () => {
      const parse = (s: string) => tryCatch(() => JSON.parse(s));
      const result = flatMap(ok('{"x":1}'), parse);
      expect(result).toEqual({ ok: true, value: { x: 1 } });
    });

    it("short-circuits on first error", () => {
      const result = flatMap(err("early"), () => ok(42));
      expect(result).toEqual({ ok: false, error: "early" });
    });
  });

  describe("unwrapOr", () => {
    it("returns the value from an ok result", () => {
      expect(unwrapOr(ok(42), 0)).toBe(42);
    });

    it("returns the fallback from an err result", () => {
      expect(unwrapOr(err("fail"), 0)).toBe(0);
    });
  });

  describe("collectResults", () => {
    it("collects all ok values into an array", () => {
      const results = [ok(1), ok(2), ok(3)];
      expect(collectResults(results)).toEqual({ ok: true, value: [1, 2, 3] });
    });

    it("returns the first error encountered", () => {
      const results = [ok(1), err("fail"), ok(3)];
      expect(collectResults(results)).toEqual({ ok: false, error: "fail" });
    });

    it("handles empty array", () => {
      expect(collectResults([])).toEqual({ ok: true, value: [] });
    });
  });
});
