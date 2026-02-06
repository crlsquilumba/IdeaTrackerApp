import { describe, it, expect } from "vitest";
import {
  validate,
  composeValidators,
  required,
  minLength,
  maxLength,
  pattern,
  numberRange,
} from "./validate.js";

describe("Validation", () => {
  describe("required", () => {
    const validator = required("name");

    it("passes when field is present", () => {
      expect(validator({ name: "Alice" })).toEqual([]);
    });

    it("fails when field is undefined", () => {
      expect(validator({})).toEqual([
        { field: "name", message: "name is required" },
      ]);
    });

    it("fails when field is empty string", () => {
      expect(validator({ name: "" })).toEqual([
        { field: "name", message: "name is required" },
      ]);
    });

    it("fails when field is null", () => {
      expect(validator({ name: null })).toEqual([
        { field: "name", message: "name is required" },
      ]);
    });
  });

  describe("minLength", () => {
    const validator = minLength("name", 3);

    it("passes when string is long enough", () => {
      expect(validator({ name: "Alice" })).toEqual([]);
    });

    it("fails when string is too short", () => {
      expect(validator({ name: "Al" })).toEqual([
        { field: "name", message: "name must be at least 3 characters" },
      ]);
    });

    it("ignores non-string values", () => {
      expect(validator({ name: 42 })).toEqual([]);
    });
  });

  describe("maxLength", () => {
    const validator = maxLength("bio", 10);

    it("passes when string is short enough", () => {
      expect(validator({ bio: "Hello" })).toEqual([]);
    });

    it("fails when string is too long", () => {
      expect(validator({ bio: "This is way too long" })).toEqual([
        { field: "bio", message: "bio must be at most 10 characters" },
      ]);
    });
  });

  describe("pattern", () => {
    const emailValidator = pattern(
      "email",
      /^[^@]+@[^@]+$/,
      "email must be a valid email address",
    );

    it("passes when pattern matches", () => {
      expect(emailValidator({ email: "a@b.com" })).toEqual([]);
    });

    it("fails when pattern does not match", () => {
      expect(emailValidator({ email: "invalid" })).toEqual([
        { field: "email", message: "email must be a valid email address" },
      ]);
    });

    it("uses default message when none provided", () => {
      const v = pattern("code", /^\d+$/);
      expect(v({ code: "abc" })).toEqual([
        { field: "code", message: "code has an invalid format" },
      ]);
    });
  });

  describe("numberRange", () => {
    const validator = numberRange("age", 0, 150);

    it("passes when number is in range", () => {
      expect(validator({ age: 25 })).toEqual([]);
    });

    it("fails when number is out of range", () => {
      expect(validator({ age: -1 })).toEqual([
        { field: "age", message: "age must be between 0 and 150" },
      ]);
    });

    it("ignores non-number values", () => {
      expect(validator({ age: "old" })).toEqual([]);
    });
  });

  describe("composeValidators", () => {
    it("combines multiple validators", () => {
      const validator = composeValidators(
        required("name"),
        minLength("name", 2),
      );

      expect(validator({ name: "Al" })).toEqual([]);
      expect(validator({})).toEqual([
        { field: "name", message: "name is required" },
      ]);
    });

    it("collects errors from all validators", () => {
      const validator = composeValidators(
        required("name"),
        required("email"),
      );

      const errors = validator({});
      expect(errors).toHaveLength(2);
    });
  });

  describe("validate", () => {
    it("returns ok for valid input", () => {
      const result = validate({ name: "Alice" }, required("name"));
      expect(result).toEqual({ ok: true, value: { name: "Alice" } });
    });

    it("returns err with validation errors for invalid input", () => {
      const result = validate({}, required("name"));
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toHaveLength(1);
        expect(result.error[0]?.field).toBe("name");
      }
    });
  });
});
