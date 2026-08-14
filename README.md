<!-- markdownlint-disable-file MD041 MD033 -->
<div align="center">

<img src="./frontend/apps/dashboard/src/assets/img/bier.png" alt="SudoSOS Logo" style="width:180px;height:auto;">

# SudoSOS 🍺

**Point of Sale and financial management system for Study Association GEWIS**

[![Backend CI](https://img.shields.io/github/actions/workflow/status/GEWIS/sudosos/backend-ci.yml?label=backend%20CI)](https://github.com/GEWIS/sudosos/actions/workflows/backend-ci.yml)
[![Frontend CI](https://img.shields.io/github/actions/workflow/status/GEWIS/sudosos/frontend-ci.yml?branch=develop&label=frontend%20CI)](https://github.com/GEWIS/sudosos/actions/workflows/frontend-ci.yml)
[![Coverage](https://coveralls.io/repos/github/GEWIS/sudosos/badge.svg?branch=develop)](https://coveralls.io/github/GEWIS/sudosos?branch=develop)
[![Release](https://img.shields.io/github/v/release/GEWIS/sudosos?label=release)](https://github.com/GEWIS/sudosos/releases)
[![License](https://img.shields.io/github/license/GEWIS/sudosos.svg)](./LICENSE)
[![Issues](https://img.shields.io/github/issues/GEWIS/sudosos)](https://github.com/GEWIS/sudosos/issues)
[![Commit activity](https://img.shields.io/github/commit-activity/m/GEWIS/sudosos)](https://github.com/GEWIS/sudosos/commits/develop)

</div>

SudoSOS is the point of sale system of Study Association GEWIS: it records purchases,
deposits, invoices, payouts, and the full audit trail behind them, and serves both the till (point of
sale) and the admin dashboard members use to manage it. This monorepo is the single, history-preserving
home for all of it, the backend API, both frontend apps, and the generated API client that ties them
together.

---

## 🗂️ Repo map

```
sudosos/
|-- backend/                 Express API, TypeORM, RBAC (sudosos-backend)
|-- frontend/
|   |-- apps/
|   |   |-- dashboard/       Admin/seller dashboard, Vue 3 (sudosos-dashboard)
|   |   `-- point-of-sale/   POS kiosk app, Vue 3 (@sudosos/point-of-sale)
|   `-- lib/
|       |-- common/          Shared Vue composables, Pinia stores, API client wrapper
|       |-- themes/          Shared PrimeVue theme
|       `-- nginx/           Nginx config and Dockerfile for serving the frontend apps (not a workspace package)
`-- packages/
    `-- sudosos-client/      Generated TypeScript API client (@gewis/sudosos-client)
```

Backend and frontend share one pnpm workspace, one lockfile, and one release train. This README covers
what's common to the whole repo; for area-specific detail once you're up and running, see
[backend/README.md](./backend/README.md) or [frontend/README.md](./frontend/README.md). Agent-facing
conventions (the exhaustive version of "Contributing" below) live in [CLAUDE.md](./CLAUDE.md), with
per-area follow-ups in [backend/CLAUDE.md](./backend/CLAUDE.md) and
[frontend/CLAUDE.md](./frontend/CLAUDE.md).

---

## 🚀 Quickstart

```bash
nvm install 22 && corepack enable
git clone git@github.com:GEWIS/sudosos.git && cd sudosos
pnpm bootstrap   # install, .env files, JWT key, build shared libs, seed dev DB
pnpm dev         # backend :3000 (+ websocket :8080), dashboard :5173
pnpm dev:pos     # point-of-sale :5174, alongside pnpm dev
```

| Service           | Port | Notes                                  |
| ----------------- | ---- | -------------------------------------- |
| Backend API       | 3000 | `HTTP_PORT`, proxied as `/api/v1`      |
| Backend WebSocket | 8080 | `WEBSOCKET_PORT`                       |
| Dashboard         | 5173 | Vite dev server                        |
| Point of sale     | 5174 | Vite dev server                        |
| Mailpit UI        | 8025 | Optional, via `docker-compose.dev.yml` |

Dev logins, seeded by `pnpm bootstrap`:

| Role  | Email              | Password | PIN    |
| ----- | ------------------ | -------- | ------ |
| Admin | `admin@sudosos.nl` | `admin`  | `0000` |
| User  | `user@sudosos.nl`  | `user`   | `1111` |

The default local database is SQLite, so no Docker is required to start developing. `docker-compose.dev.yml`
adds optional prod-parity services (MariaDB, Redis, Mailpit, pdf-compiler) for the parts of `pnpm bootstrap`
that don't need them day to day.

---

## 🛠️ Command reference

```bash
pnpm build                # everything, in topo order
pnpm lint                 # everything
pnpm test                 # backend test suite
pnpm format / format:fix  # prettier check/write, frontend only

pnpm backend:build|lint|test|swagger|watch  # same scripts, scoped to the backend
pnpm frontend:build|lint                    # same scripts, scoped to frontend workspaces

pnpm generate:client   # regenerate @gewis/sudosos-client from the current backend swagger spec
                       # needs Java 11+, and only when the backend API changed; the generated
                       # src/ is committed, so this is never required day to day

pnpm --filter <pkg> <script>  # anything narrower than the above
```

---

## 🤝 Contributing

We're a small student association, so contributions from members are how this project moves forward. The
short version:

- **Branch from `develop`; PRs target `develop`.** `main` only moves via releases, so don't branch from it
  or target it directly.
- **Commit messages** use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) prefixes
  (`feat:`, `fix:`, `chore:`, ...); this is enforced by commitlint on every commit.
- **PR titles are plain sentences, no prefix.** They're shown as-is on a screen in the GEWIS room, so
  `Remove deprecated non-PoS token endpoints` reads better there than `chore: remove deprecated ...`.
- **Rebase, don't merge.** Keep history linear; force-push your own branch with `--force-with-lease` after
  a rebase, never plain `--force`.
- **Before opening a PR**, run the linter and the relevant test suite for the area you touched (see the
  [Command reference](#command-reference) above). CI runs the same checks and will block merging
  otherwise.
- Every PR needs at least one approval before it can merge into `develop` (branch protection enforces
  this), and the required CI checks above need to be green.

This covers the everyday flow. For the exhaustive version, including commit history philosophy, how we
triage automated review feedback, and the full code quality checklist, see [CLAUDE.md](./CLAUDE.md).

---

## 🙌 Contributors

Thank you to everyone who has put time into building and maintaining SudoSOS over the years. This
project runs on volunteer effort from GEWIS members, past and present.

<a href="https://github.com/GEWIS/sudosos/graphs/contributors"><img src="https://contributors.aika.dev/GEWIS/sudosos/contributors.svg?max=44" alt="Code contributors" /></a>

---

## 📄 License

AGPL-3.0-or-later. See [LICENSE](./LICENSE).
