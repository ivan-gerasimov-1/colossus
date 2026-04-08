# Colossus

Baseline npm-workspaces monorepo scaffolded by `create-lv48-app`.

## Workspaces

- `apps/web` - React + Vite product app
- `apps/site` - Astro marketing site
- `apps/api` - Node + Hono API
- `packages/` - reserved workspace container for future shared packages

## Getting started

1. Install dependencies with `npm install`
2. Start the web app with `npm run dev --workspace @colossus/web`
3. Start the site with `npm run dev --workspace @colossus/site`
4. Start the API with `npm run dev --workspace @colossus/api`
