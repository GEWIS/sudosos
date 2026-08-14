# SudoSOS Frontend

This is the `frontend/` half of the [GEWIS/sudosos](https://github.com/GEWIS/sudosos) monorepo -- the
dashboard and point-of-sale Vue apps, plus the shared libraries they depend on. It assumes you already
have a bootstrapped monorepo checkout; see the [root README](../README.md) if you don't (`pnpm bootstrap
&& pnpm dev` is the one-command version). For component/store/i18n conventions, see
[../CLAUDE.md](../CLAUDE.md) and [./CLAUDE.md](./CLAUDE.md).

## Projects

| Path                 | Package                            | What it is                                             |
| -------------------- | ---------------------------------- | ------------------------------------------------------ |
| `apps/dashboard`     | `sudosos-dashboard`                | Admin/seller dashboard, Vue 3                          |
| `apps/point-of-sale` | `@sudosos/point-of-sale`           | POS kiosk app, Vue 3                                   |
| `lib/common`         | `@sudosos/sudosos-frontend-common` | Shared components, composables, services, Pinia stores |
| `lib/themes`         | `@sudosos/themes`                  | PrimeVue theme shared by both apps                     |
| `lib/nginx`          | (not a workspace package)          | Nginx config + Dockerfile for serving the built apps   |

## Running the apps

```bash
pnpm dev         # backend :3000 + dashboard :5173
pnpm dev:pos     # point-of-sale :5174 (run alongside pnpm dev)
```

Dashboard at `localhost:5173`, point of sale at `localhost:5174`. See the root
[command reference](../README.md#command-reference) for the full list (`pnpm frontend:lint`,
`pnpm frontend:build`, `pnpm format` / `pnpm format:fix`, ...).

> [!TIP]
> To point a running dev server at a different backend, edit `VITE_ENV` in `apps/dashboard/.env` or
> `apps/point-of-sale/.env` (`local` | `test` | `prod`) rather than switching scripts.

## Dev tooling notes

- **Linting and formatting** extend the central [GEWIS JS configs](https://github.com/GEWIS/js-configs).
  Run `pnpm frontend:lint` and `pnpm format` from the repo root (`pnpm format:fix` to autofix); both are
  enforced by CI on every pull request.
- **Translation consistency.** The dashboard ships English, Dutch, and Polish locale files under
  `apps/dashboard/src/locales/`; CI runs `frontend/scripts/check-translations.js` to make sure all three
  stay in sync key-for-key. Run it locally after adding or renaming a translation key:
  `node scripts/check-translations.js` (from `frontend/`).

---

Contributing conventions and the license are the same for the whole monorepo -- see the
[root README](../README.md#contributing).
