# @utils/core

Type-safe utility library for robust error handling, validation, and data transformation.

## Modules

### Result (`src/result.ts`)
A discriminated union type (`Result<T, E>`) for explicit error handling — replaces scattered try/catch blocks with composable, type-safe error flows.

- `ok(value)` / `err(error)` — construct results
- `tryCatch(fn)` / `tryCatchAsync(fn)` — wrap throwing functions
- `mapResult`, `mapError`, `flatMap` — transform and chain results
- `unwrapOr` — extract with a fallback
- `collectResults` — aggregate an array of results

### Validation (`src/validate.ts`)
Composable validators that integrate with the Result type. Each validator is a pure function returning error messages.

- `required`, `minLength`, `maxLength`, `pattern`, `numberRange` — built-in validators
- `composeValidators` — combine multiple validators
- `validate` — run a validator and get a `Result`

### Pipeline (`src/pipeline.ts`)
Function composition for readable data transformation chains — replaces deeply nested calls.

- `pipe(value, fn1, fn2, ...)` — transform a value through functions
- `flow(fn1, fn2, ...)` — create a reusable composed function
- `tap(fn)` — execute side-effects without altering the value

### Collections (`src/collections.ts`)
Type-safe utilities for common collection operations.

- `groupBy`, `keyBy`, `uniqueBy` — organize data
- `partition`, `chunk` — split arrays
- `pick`, `omit` — reshape objects

### Async (`src/async.ts`)
Controlled concurrency and retry logic.

- `retry(fn, options)` — retry with configurable backoff, returns `Result`
- `mapWithConcurrency(items, limit, fn)` — process items with bounded parallelism
- `debounce(fn, delayMs)` — debounce function calls

## Development

```bash
npm install
npm run build       # Compile TypeScript
npm test            # Run tests
npm run typecheck   # Type-check without emitting
```
