/**
 * Lightweight, composable validation using schema-like rules.
 * Each validator is a function that returns a list of error messages.
 */

import { type Result, ok, err } from "./result.js";

export type ValidationError = {
  field: string;
  message: string;
};

export type Validator<T> = (value: T) => ValidationError[];

/** Combine multiple validators for the same value. */
export function composeValidators<T>(
  ...validators: Validator<T>[]
): Validator<T> {
  return (value: T) => validators.flatMap((v) => v(value));
}

/** Run a validator and return a Result. */
export function validate<T>(
  value: T,
  validator: Validator<T>,
): Result<T, ValidationError[]> {
  const errors = validator(value);
  if (errors.length > 0) {
    return err(errors);
  }
  return ok(value);
}

// --- Built-in validators ---

export function required(field: string): Validator<Record<string, unknown>> {
  return (obj) => {
    const val = obj[field];
    if (val === undefined || val === null || val === "") {
      return [{ field, message: `${field} is required` }];
    }
    return [];
  };
}

export function minLength(
  field: string,
  min: number,
): Validator<Record<string, unknown>> {
  return (obj) => {
    const val = obj[field];
    if (typeof val === "string" && val.length < min) {
      return [
        { field, message: `${field} must be at least ${min} characters` },
      ];
    }
    return [];
  };
}

export function maxLength(
  field: string,
  max: number,
): Validator<Record<string, unknown>> {
  return (obj) => {
    const val = obj[field];
    if (typeof val === "string" && val.length > max) {
      return [
        { field, message: `${field} must be at most ${max} characters` },
      ];
    }
    return [];
  };
}

export function pattern(
  field: string,
  regex: RegExp,
  message?: string,
): Validator<Record<string, unknown>> {
  return (obj) => {
    const val = obj[field];
    if (typeof val === "string" && !regex.test(val)) {
      return [
        { field, message: message ?? `${field} has an invalid format` },
      ];
    }
    return [];
  };
}

export function numberRange(
  field: string,
  min: number,
  max: number,
): Validator<Record<string, unknown>> {
  return (obj) => {
    const val = obj[field];
    if (typeof val === "number" && (val < min || val > max)) {
      return [
        { field, message: `${field} must be between ${min} and ${max}` },
      ];
    }
    return [];
  };
}
