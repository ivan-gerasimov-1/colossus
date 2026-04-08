# Backwards-Compatible Deployments

Frontend and backend are deployed independently and may go live at different times. Every API change must be safe to deploy in any order.

## Core Rule

Never ship a breaking API change in a single PR that touches both frontend and backend. If a change breaks the contract — split it into two PRs where each step is independently deployable.

## Safe Changes (single PR)

- **Adding a new field** to an API response — old frontend ignores unknown fields.
- **Adding a new endpoint** — deploy backend first; old frontend doesn't call it.
- **Adding an optional query/body parameter** — old frontend doesn't send it, backend uses a default.

## Breaking Changes (two-step deploy)

### Renaming or removing a response field

1. **PR 1 (backend):** Return both old and new field.
2. **PR 2 (frontend):** Switch to new field.
3. **PR 3 (backend):** Remove old field.

### Changing request payload shape

1. **PR 1 (backend):** Accept both old and new shape.
2. **PR 2 (frontend):** Switch to new shape.
3. **PR 3 (backend):** Drop old shape support.

### Changing endpoint behavior

Introduce a new version via path (`/v2/...`) or query param. Old frontend hits old behavior, new frontend hits new. Remove old after both are deployed.

## Checklist Before Merging

- Can the new frontend work with the current production backend?
- Can the new backend work with the current production frontend?

If either answer is no — split the PR.
