# Agent Working Context

The role of this file is to describe common mistakes and confusion points that agents might encounter while working in this project.

If you encounter anything in the project that is surprising, unclear, or worth preserving as a recurring preference, convention, constraint, or project-specific rule, alert the developer you are working with and record it in the `Learned Conventions` section.

## General Guardrails

- Use `npm` (with `npm workspaces`) as the package manager.
- Install new packages with `--save-exact`.
- Avoid editing automatically generated files.
- If the user’s intent changes between turns, re-evaluate and switch to the matching skill before taking action.

## Commits

- Write commit messages in English.
- Use Conventional Commits:
  - `feat`: new functionality
  - `fix`: bug fixes
  - `docs`: documentation
  - `style`: formatting
  - `refactor`: refactoring
  - `test`: tests
  - `chore`: maintenance

Example commit message:

```text
chore(*): cleanup code
```

## Engineering Conventions

Before writing or changing code, read [engineering-conventions.md](./docs/engineering-conventions.md).

## Learned Conventions
