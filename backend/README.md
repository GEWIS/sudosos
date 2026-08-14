# SudoSOS Backend

This is the `backend/` half of the [GEWIS/sudosos](https://github.com/GEWIS/sudosos) monorepo -- the
Express API, TypeORM entities, and RBAC layer behind SudoSOS. It assumes you already have a bootstrapped
monorepo checkout; see the [root README](../README.md) if you don't (`pnpm bootstrap && pnpm dev` is the
one-command version of everything below). For architecture, domain model, and agent-facing conventions,
see [../CLAUDE.md](../CLAUDE.md) and [./CLAUDE.md](./CLAUDE.md).

## Overview

The backend is a REST API for managing transactions, user accounts, products, payments, and the rest of
SudoSOS's financial operations. It's the single source of truth the dashboard and point-of-sale apps both
talk to.

## Local setup, beyond `pnpm bootstrap`

`pnpm bootstrap` (from the repo root) generates a JWT key, initializes the database schema, and seeds dev
data for you. The notes below explain what it's actually doing, for when you need to customize any of it.

**JWT key.** Authentication is RSA-signed JWTs; the private key lives at `backend/config/jwt.key` and
isn't committed. Regenerate or replace it with:

```bash
mkdir -p backend/config
openssl genrsa -out backend/config/jwt.key 2048
```

Point at a different path with the `JWT_KEY_PATH` env var (defaults to `config/jwt.key`, relative to
`backend/`).

**Database schema vs. migrations.** Two ways to get a schema, and `pnpm bootstrap` picks the first for
you:

- `pnpm schema` -- drops and recreates tables directly from the current TypeORM entities. Fast, no
  history, fine for SQLite dev. **Clear your local database first** (delete `local.sqlite`, or drop all
  tables on MariaDB) -- it doesn't migrate existing data.
- `pnpm migrate` -- runs the versioned migrations under `src/database/migration/`. This is what
  production and CI use, and what you want against MariaDB if you care about migration correctness rather
  than just a working schema.

Either way, follow up with `pnpm seed` (or `pnpm seed:dev` for richer fixture data) and `pnpm maintenance`
to set up default roles and permissions -- or just run one of the combined scripts below.

**Getting a token for manual API testing.** Hit `/authentication/mock` with a valid user ID to get back a
JWT, then paste it into Swagger UI's "Authorize" dialog (see [API documentation](#api-documentation)
below) to authenticate further requests.

## Stripe configuration (optional)

Only needed for deposit functionality. Configure with **restricted keys only**:

| Env var                 | Purpose                                           |
| ----------------------- | ------------------------------------------------- |
| `STRIPE_PUBLIC_KEY`     | Publishable key (safe for frontend)               |
| `STRIPE_PRIVATE_KEY`    | Restricted secret key -- see permissions below    |
| `STRIPE_WEBHOOK_SECRET` | Webhook endpoint secret, for validating callbacks |
| `STRIPE_RETURN_URL`     | Where Stripe redirects users after payment        |

When creating the restricted API key, grant only:

- Write access on all webhooks
- Write access on payment intents

## Available scripts

Run these from `backend/`, or via `pnpm --filter sudosos-backend <script>` / `pnpm backend:<script>` from
the repo root (see the root [command reference](../README.md#command-reference)).

| Script                   | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `pnpm watch`             | Dev server with hot reload                        |
| `pnpm build`             | Compile TypeScript to `out/`                      |
| `pnpm serve`             | Run the compiled production server                |
| `pnpm schema`            | Create/reset the database schema from entities    |
| `pnpm migrate`           | Run database migrations                           |
| `pnpm seed` / `seed:dev` | Seed initial data / richer dev fixture data       |
| `pnpm maintenance`       | Set up default roles and permissions              |
| `pnpm init:schema`       | `schema` + `seed` + `maintenance` in one go       |
| `pnpm init:migrate`      | `migrate` + `seed` + `maintenance` in one go      |
| `pnpm test`              | Run all tests (Vitest)                            |
| `pnpm test-file <path>`  | Run a single test file                            |
| `pnpm coverage`          | Run tests with a coverage report                  |
| `pnpm lint` / `lint-fix` | ESLint, check or autofix                          |
| `pnpm swagger`           | Regenerate `out/swagger.json` from JSDoc comments |
| `pnpm cron`              | Start the cron job scheduler                      |

## API documentation

- **Swagger UI (dev):** `http://localhost:3000/api-docs`
- **Swagger UI (production):** `https://sudosos.gewis.nl/api/api-docs/`
- **Full docs site** (architecture, domain model, generated TypeDoc): `https://sudosos.gewis.nl/docs/`,
  built from `backend/docs/` by [`docs.yml`](../.github/workflows/docs.yml). Run it locally with
  `pnpm docs:dev`.

## IDE setup (IntelliJ/WebStorm)

For ESLint to fix issues automatically on save: Preferences -> Languages & Frameworks -> JavaScript ->
Code Quality Tools -> ESLint -> check "Run eslint --fix on save".

---

Contributing conventions, commit style, and the license are the same for the whole monorepo -- see the
[root README](../README.md#contributing).
