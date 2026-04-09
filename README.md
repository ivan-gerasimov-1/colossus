# Colossus

Baseline npm-workspaces monorepo scaffolded by `create-lv48-app`.

## Workspaces

- `packages/` - shared workspace packages used across applications
- `apps/` - application workspaces organized as sub-packages in the form `apps/<app-name>/<surface>`
  - `apps/<app-name>/web` - React + Vite app surface
  - `apps/<app-name>/site` - Astro site surface
  - `apps/<app-name>/api` - Node + Hono API surface

- Main product applications use the `codename-*` naming convention
- AI-generated playground applications use the `playground-*` naming convention

## Getting started

`npm install`
