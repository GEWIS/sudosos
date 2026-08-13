<!-- markdownlint-disable-file MD041 MD033 -->
<div align="center">

<img src="https://github.com/GEWIS/sudosos-backend/blob/develop/backend_logo.png?raw=true"
  alt="SudoSOS Logo" style="width:200px;height:auto;">

<h1>SudoSOS</h1>

<p align="center">
  <strong>Point of Sale and financial management system for Study Association GEWIS</strong>
</p>

[![License](https://img.shields.io/github/license/GEWIS/sudosos.svg)](./LICENSE)


</div>

SudoSOS records purchases, deposits, invoices, payouts, and the audit trail around them. This is the monorepo:
one history-preserving home for the backend API, the dashboard and point-of-sale frontends, and the generated
API client that ties them together.

## Repo map

| Path                            | What it is                                                        |
| -------------------------------- | ------------------------------------------------------------------ |
| `backend/`                       | Express API, TypeORM, RBAC — `sudosos-backend`                    |
| `frontend/apps/dashboard/`       | Admin/seller dashboard (Vue 3) — `sudosos-dashboard`               |
| `frontend/apps/point-of-sale/`   | POS kiosk app (Vue 3) — `@sudosos/point-of-sale`                   |
| `frontend/lib/common/`           | Shared Vue composables, Pinia stores, API client wrapper           |
| `frontend/lib/themes/`           | Shared PrimeVue theme                                              |
| `frontend/lib/nginx/`            | Nginx config + Dockerfile for serving the frontend apps (not a workspace package) |
| `packages/sudosos-client/`       | Generated TypeScript API client, published as `@gewis/sudosos-client` |

Backend and frontend share one pnpm workspace, one lockfile, and one release train — see
[CLAUDE.md](./CLAUDE.md) for the full agent-facing conventions, or the per-area
[backend/CLAUDE.md](./backend/CLAUDE.md) and [frontend/CLAUDE.md](./frontend/CLAUDE.md).

## Quickstart

```bash
nvm install 22 && corepack enable
git clone git@github.com:GEWIS/sudosos.git && cd sudosos
pnpm bootstrap   # install, .env files, JWT key, build shared libs, seed dev DB
pnpm dev         # backend :3000 (+ websocket :8080), dashboard :5173
pnpm dev:pos     # point-of-sale :5174, alongside pnpm dev
```

| Service          | Port | Notes                                |
| ----------------- | ---- | ------------------------------------- |
| Backend API       | 3000 | `HTTP_PORT`, proxied as `/api/v1`     |
| Backend WebSocket | 8080 | `WEBSOCKET_PORT`                      |
| Dashboard         | 5173 | Vite dev server                       |
| Point of sale     | 5174 | Vite dev server                       |
| Mailpit UI        | 8025 | Optional, via `docker-compose.dev.yml`|

Dev logins (seeded by `pnpm bootstrap`): `admin@sudosos.nl` / `admin` / PIN `0000`,
`user@sudosos.nl` / `user` / PIN `1111`.

The default local database is SQLite — no Docker required to start developing. `docker-compose.dev.yml`
adds optional prod-parity services (MariaDB, Redis, Mailpit, pdf-compiler) for the parts of `pnpm bootstrap`
that don't need them day to day.

## Command reference

```bash
pnpm build              # everything, in topo order
pnpm lint                # everything
pnpm test                # backend test suite
pnpm format / format:fix # prettier check/write (frontend)

pnpm backend:build|lint|test|swagger|watch
pnpm frontend:build|lint

pnpm generate:client     # regenerate @gewis/sudosos-client from the current backend swagger spec
                         #   (needs Java 11+; only run when the backend API changed —
                         #   the generated src/ is committed, so this is never required day to day)

pnpm --filter <pkg> <script>   # anything narrower than the above
```

## Contributing

- Branch from `develop`; PRs target `develop`.
- Commit messages use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) prefixes
  (`feat:`, `fix:`, `chore:`, ...). PR **titles** are plain sentences, no prefix — they're shown on a
  screen in the GEWIS room.
- Rebase, don't merge. Force-push with `--force-with-lease`.
- Full conventions (PR feedback workflow, commit history philosophy, code quality checklist) live in
  [CLAUDE.md](./CLAUDE.md).

## License

AGPL-3.0-or-later. See [LICENSE](./LICENSE).
