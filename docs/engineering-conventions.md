# Engineering Conventions

This document describes the development conventions, code style guardrails, and architectural preferences that developers and agents should follow in this project.

## Testing

- All new functionality must be covered by unit tests.
- Tests should validate behavior, not implementation details.

## Style Preferences

- Prefer simple step-by-step expressions over dense nested conditionals or ternaries.

## Type and File Placement

- By default, keep shared type declarations in a neighboring `types.ts` file instead of colocating them with implementation.
  - Exception: local component/function `props`, `options`, and `params` types may stay next to the implementation.

## TypeScript

- Do not use `any`.
- Do not use type assertions such as `value as T`.
- `as const` is allowed for literal narrowing and enum-like constant objects.
- Do not use `@ts-ignore` or `@ts-expect-error`.
- Prefer inferred function return types.
  - Avoid explicit return type annotations unless there is a clear need (public API contract, overload, or inference issue).
- Prefer explicit domain types over `unknown`; use `unknown` only at safe boundaries.

## Naming Conventions

- Use PascalCase and constant objects for enums.
- Use objects with `as const` + `typeof` for union types.

## Money and Currency

- All monetary amounts are stored as integers in minor currency units (e.g., cents). `9999` means `$99.99`.

## Deployments

- Frontend and backend deploy independently. All API changes must be backwards-compatible. See [backwards-compatible-deployments.md](./backwards-compatible-deployments.md).
