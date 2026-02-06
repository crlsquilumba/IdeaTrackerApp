import { describe, it, expect } from "vitest";
import {
  groupBy,
  keyBy,
  uniqueBy,
  partition,
  chunk,
  pick,
  omit,
} from "./collections.js";

describe("Collections", () => {
  describe("groupBy", () => {
    it("groups items by the key function", () => {
      const items = [
        { type: "a", value: 1 },
        { type: "b", value: 2 },
        { type: "a", value: 3 },
      ];
      const result = groupBy(items, (i) => i.type);
      expect(result).toEqual({
        a: [
          { type: "a", value: 1 },
          { type: "a", value: 3 },
        ],
        b: [{ type: "b", value: 2 }],
      });
    });

    it("handles empty array", () => {
      expect(groupBy([], () => "key")).toEqual({});
    });
  });

  describe("keyBy", () => {
    it("creates a lookup map", () => {
      const users = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ];
      const result = keyBy(users, (u) => u.id);
      expect(result["1"]).toEqual({ id: "1", name: "Alice" });
      expect(result["2"]).toEqual({ id: "2", name: "Bob" });
    });

    it("last value wins for duplicate keys", () => {
      const items = [
        { id: "1", v: "first" },
        { id: "1", v: "second" },
      ];
      const result = keyBy(items, (i) => i.id);
      expect(result["1"]?.v).toBe("second");
    });
  });

  describe("uniqueBy", () => {
    it("deduplicates by identity by default", () => {
      expect(uniqueBy([1, 2, 2, 3, 1])).toEqual([1, 2, 3]);
    });

    it("deduplicates by key function", () => {
      const items = [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
        { id: 1, name: "c" },
      ];
      const result = uniqueBy(items, (i) => i.id);
      expect(result).toEqual([
        { id: 1, name: "a" },
        { id: 2, name: "b" },
      ]);
    });
  });

  describe("partition", () => {
    it("splits array into pass and fail groups", () => {
      const [evens, odds] = partition([1, 2, 3, 4, 5], (n) => n % 2 === 0);
      expect(evens).toEqual([2, 4]);
      expect(odds).toEqual([1, 3, 5]);
    });

    it("handles all-pass case", () => {
      const [pass, fail] = partition([2, 4], () => true);
      expect(pass).toEqual([2, 4]);
      expect(fail).toEqual([]);
    });
  });

  describe("chunk", () => {
    it("splits array into chunks of given size", () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    });

    it("handles exact division", () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([
        [1, 2],
        [3, 4],
      ]);
    });

    it("handles empty array", () => {
      expect(chunk([], 3)).toEqual([]);
    });

    it("throws on non-positive size", () => {
      expect(() => chunk([1], 0)).toThrow("Chunk size must be positive");
    });
  });

  describe("pick", () => {
    it("picks specified keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(pick(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
    });

    it("ignores missing keys", () => {
      const obj = { a: 1 } as Record<string, number>;
      expect(pick(obj, ["a", "b"])).toEqual({ a: 1 });
    });
  });

  describe("omit", () => {
    it("omits specified keys", () => {
      const obj = { a: 1, b: 2, c: 3 };
      expect(omit(obj, ["b"])).toEqual({ a: 1, c: 3 });
    });

    it("returns full object when no keys omitted", () => {
      const obj = { a: 1, b: 2 };
      expect(omit(obj, [])).toEqual({ a: 1, b: 2 });
    });
  });
});
