<div align="center">

<!-- Centered Logo Image -->
<img src="https://github.com/GEWIS/sudosos-frontend/blob/develop/apps/dashboard/src/assets/img/bier.png?raw=true" alt="Logo" style="width:200px;height:auto;">

<!-- Centered Name Beneath Logo -->
<h1>SudoSOS Frontend</h1>

[![Uptime](https://uptime.gewis.nl/api/badge/2/uptime)](https://sudosos.gewis.nl/api/v1/ping)
[![Issues](https://img.shields.io/github/issues/GEWIS/sudosos)](https://github.com/GEWIS/sudosos/issues)

</div>

This is the `frontend/` half of the [GEWIS/sudosos](https://github.com/GEWIS/sudosos) monorepo — the
dashboard and point-of-sale Vue apps, plus the shared libraries they depend on. For the one-command
monorepo quickstart (`pnpm bootstrap && pnpm dev`), see the [root README](../README.md); for
frontend-specific agent conventions, see [../CLAUDE.md](../CLAUDE.md) or [./CLAUDE.md](./CLAUDE.md).

## Projects

1. **`lib/nginx`**: Nginx proxy configuration for serving the built frontend apps (not a workspace package).
2. **`lib/common`** (`@sudosos/sudosos-frontend-common`): Shared components, helper functions, services, and Pinia stores.
3. **`lib/themes`** (`@sudosos/themes`): PrimeVue theme shared by both apps.
4. **`apps/point-of-sale`** (`@sudosos/point-of-sale`): The POS kiosk app, built with Vue 3 and TypeScript.
5. **`apps/dashboard`** (`sudosos-dashboard`): The admin/seller dashboard, built with Vue 3.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open
an issue on the [issue tracker](https://github.com/GEWIS/sudosos/issues).

## Development quick start

This package manager is **pnpm**, not yarn — install and build everything from the monorepo root:

```bash
nvm install 22 && corepack enable
git clone git@github.com:GEWIS/sudosos.git && cd sudosos
pnpm bootstrap
pnpm dev         # backend :3000 + dashboard :5173
pnpm dev:pos     # point-of-sale :5174 (run alongside pnpm dev)
```

You can access the dashboard and point of sale at `localhost:5173` and `localhost:5174` respectively.
See the root [README's command reference](../README.md#command-reference) for the full command list
(`pnpm frontend:lint`, `pnpm frontend:build`, `pnpm format` / `pnpm format:fix`, ...).

> [!TIP]
> To point a running dev server at a different backend, edit `VITE_ENV` in `apps/dashboard/.env` or
> `apps/point-of-sale/.env` (`local` | `test` | `prod`) rather than switching yarn scripts — the old
> `yarn dev-dashboard:test` / `:prod` / `:local` variants are gone along with yarn.

### Short note on ESLint and Prettier

We use linting and prettier throughout the project, these are an extension on the
[central JS-Configs](https://github.com/GEWIS/js-configs). Run `pnpm frontend:lint` and `pnpm format`
from the repo root (or `pnpm lint` / `pnpm format:fix` to autofix). This is also enforced by CI on
GitHub when creating a pull request.

## Contributors

This project exists thanks to all the people who contribute code.

<a href="https://github.com/GEWIS/sudosos/graphs/contributors"><img src="https://contributors.aika.dev/GEWIS/sudosos/contributors.svg?max=44" alt="Code contributors" /></a>
