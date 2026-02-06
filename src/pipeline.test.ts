import { describe, it, expect, vi } from "vitest";
import { pipe, flow, tap } from "./pipeline.js";

describe("Pipeline", () => {
  describe("pipe", () => {
    it("returns the value when no functions are passed", () => {
      expect(pipe(42)).toBe(42);
    });

    it("applies a single function", () => {
      expect(pipe(5, (n) => n * 2)).toBe(10);
    });

    it("applies multiple functions left to right", () => {
      const result = pipe(
        "  hello  ",
        (s) => s.trim(),
        (s) => s.toUpperCase(),
        (s) => `[${s}]`,
      );
      expect(result).toBe("[HELLO]");
    });

    it("handles type transformations across steps", () => {
      const result = pipe(
        42,
        (n) => n.toString(),
        (s) => s.length,
      );
      expect(result).toBe(2);
    });
  });

  describe("flow", () => {
    it("composes a single function", () => {
      const double = flow((n: number) => n * 2);
      expect(double(5)).toBe(10);
    });

    it("composes multiple functions", () => {
      const process = flow(
        (s: string) => s.trim(),
        (s) => s.split(" "),
        (arr) => arr.length,
      );
      expect(process("  a b c  ")).toBe(3);
    });

    it("creates a reusable function", () => {
      const toUpperTrimmed = flow(
        (s: string) => s.trim(),
        (s) => s.toUpperCase(),
      );
      expect(toUpperTrimmed("  hi  ")).toBe("HI");
      expect(toUpperTrimmed("world ")).toBe("WORLD");
    });
  });

  describe("tap", () => {
    it("executes side effect without changing value", () => {
      const sideEffect = vi.fn();
      const result = pipe(42, tap(sideEffect));
      expect(result).toBe(42);
      expect(sideEffect).toHaveBeenCalledWith(42);
    });

    it("can be used in a pipeline for logging", () => {
      const log: number[] = [];
      const result = pipe(
        5,
        (n) => n + 1,
        tap((n) => log.push(n)),
        (n) => n * 2,
      );
      expect(result).toBe(12);
      expect(log).toEqual([6]);
    });
  });
});
