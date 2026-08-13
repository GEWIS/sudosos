# sudosos-dashboard

This is the admin/seller dashboard, rewritten in Vue 3. It's the website you see when you go to
sudosos.gewis.nl. It lives at `frontend/apps/dashboard/` inside the
[GEWIS/sudosos](https://github.com/GEWIS/sudosos) monorepo — see the [root README](../../../README.md)
for the one-command setup (`pnpm bootstrap && pnpm dev`).

## Recommended IDE Setup

We recommend using [Jetbrains Webstorm](https://www.jetbrains.com/webstorm/) for this project, or
VS Code with the official [Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

## Project Setup

This package manager is **pnpm**, not npm or yarn, and installs happen at the repo root (one workspace,
one lockfile) — see the [root README](../../../README.md#quickstart) rather than running `npm install`
here directly. Copy `.env.example` to `.env` in this directory before starting the dev server.

From the repo root:

```sh
pnpm dev:dashboard   # or `pnpm dev` for backend + dashboard together
```

From this directory, once the workspace is installed:

```sh
pnpm dev:local      # hot-reload dev server against a local backend
pnpm build           # type-check + build for production
pnpm lint            # ESLint
```
