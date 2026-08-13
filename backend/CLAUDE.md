# SudoSOS Backend — Agent Patterns & Conventions

**Last updated:** 2026-03-13

This file documents backend-specific patterns. For general project guidelines see [../CLAUDE.md](../CLAUDE.md).

---

## Domain Recap

Full documentation lives in `docs/content/general/`. Read those for the complete picture — this is just a cheat sheet.

**Key docs:**
- [0-overview.md](./docs/content/general/0-overview.md) — what SudoSOS is, who uses it, glossary
- [1-core-concepts.md](./docs/content/general/1-core-concepts.md) — domain model: transactions, transfers, balance, revisions, invoices, RBAC
- [2-key-workflows.md](./docs/content/general/2-key-workflows.md) — purchase, invoice, deposit (Stripe), payout flows
- [3-system-architecture.md](./docs/content/general/3-system-architecture.md) — request lifecycle, where correctness is enforced
- [4-external-integrations.md](./docs/content/general/4-external-integrations.md) — GEWISDB, LDAP, Stripe, mail
- [5-understanding-codebase.md](./docs/content/general/5-understanding-codebase.md) — file map, common task checklists

**Domain essentials:**

- **Transaction** = purchase. `Transaction` (buyer) → `SubTransaction` (per seller/container) → `SubTransactionRow` (per product revision). **Container owner = seller.**
- **Transfer** = non-purchase money movement. Void→user = top-up; user→void = payout.
- **Balance** = cache derived from transactions + transfers. Not a source of truth.
- **Revisions** = immutable snapshots (Product, Container, POS). Updates create new revisions; past transactions reference old ones.
- **RBAC** = `<action>:<relation>:<resource>:<attributes>`. Relation (`all/organ/own`) computed per request in controller policies.
- **Dinero** = all money as integers, no floats. VAT explicit, per product revision.
- **Soft deletion** preferred — financial history must remain auditable.

---

## Project Structure

```
backend/
├── src/
│   ├── controller/           # Express routes, RBAC policy, request/response DTOs
│   ├── service/              # Business logic (returns entities, not responses)
│   ├── entity/               # TypeORM entities (including revisioned entities)
│   ├── helpers/              # Shared utilities (pagination, validators)
│   ├── middleware/           # Express middleware (auth/token)
│   ├── rbac/                 # Roles, permissions, enforcement helpers
│   ├── mailer/               # Email templates and sending
│   ├── database/             # DB setup, migrations
│   └── gewis/                # GEWIS-specific integration (LDAP, JWTs, MemberUser)
├── test/
│   ├── unit/{controller,service}/
│   ├── setup.ts              # Global test setup
│   └── seed/                 # Test fixtures & seeders (NOT production code)
├── cli/                      # CLI entry points (seed, maintenance)
└── Dockerfile
```

Run all commands below from `backend/`, or from the repo root via `pnpm --filter sudosos-backend <script>` / the `pnpm backend:*` shortcuts documented in [../CLAUDE.md](../CLAUDE.md).

---

## Architecture Conventions

### Request Lifecycle

Middleware (auth) → Controller (RBAC, HTTP translation) → Service (business rules) → Entity (persistence)

**Controllers stay thin.** Business rules belong in services.

### Service ↔ Controller Contract

Services return **entities** (or `[entities, count]` for lists). Controllers convert to response DTOs:

```typescript
const [foos, count] = await fooService.listFoos();
res.json(toResponse(foos.map(FooService.asFooResponse), count, pagination));
```

### Entity Access

**Always use the service's access filter**, never raw `Entity.findOne()`:

```typescript
// ❌ Bypasses soft-delete and POS filtering
const user = await User.findOne({ where: { id } });

// ✅
const user = await User.findOne(UserService.getOptions({ id }));
// Pass allowPos: true for auth flows where POS users are valid
```

### RBAC Field Gating

Gate response fields in the **controller** (has `req.token.roles`, can strip before `res.json()`):

```typescript
if (!roleManager.can(req.token.roles, 'get', 'relation', 'User', ['email'])) {
  delete response.email;
}
```

### Boundary Rule

**`src/` must never import from `test/`.** Seeders live in `test/seed/`. CLI scripts in `cli/` may import from both.

### JSDoc & Swagger

**`@typedef` JSDoc blocks are load-bearing for Swagger spec generation — never remove them.** Extra prose goes above the `@typedef` line, not as a replacement.

---

## Testing

### Running Tests

```bash
# Full suite (from backend/, or `pnpm backend:test` from root)
pnpm test

# Single file — vitest, not mocha (env vars are critical — without them, tests hit stale local.sqlite)
TYPEORM_CONNECTION=sqlite TYPEORM_DATABASE=':memory:' TYPEORM_SYNCHRONIZE=true \
  pnpm exec vitest run 'test/unit/controller/foo.ts'
```

Backend tests run on **vitest** (migrated off mocha) — `pnpm exec vitest run '<path>'` for a single file, `pnpm test` / `pnpm run coverage` for the full suite.

### Seeding

**`.seed()`** = bulk anonymous test data. **`.init()`** = named dev data. Both on the same seeder class.

```typescript
// Test seeding — never reuse role names across .seed() calls
const roles = await new RbacSeeder().seed([{ name: 'Test Role', ... }]);

// Production-like RBAC for realistic token testing
await ensureProductionRoles();
const token = signTokenFor(user);
```

### Known test-isolation gap

`test/unit/controller/terminal-payment-controller.ts` passes cleanly in isolation but has been observed failing when run as part of the full suite (some other file's state leaks in — not yet root-caused). If you hit unexplained failures there, try running that file alone before assuming your change broke it.

---

## Do / Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| Return entities from services, DTOs from controllers | Put business rules in controllers |
| Use `UserService.getOptions()` for user lookups | Call `Entity.findOne()` directly |
| Gate fields via `roleManager.can()` in controller | Put RBAC field logic in services or middleware |
| Put seed scripts in `cli/` | Import from `test/` in `src/` |
| Run `pnpm lint` before committing | Remove `@typedef` JSDoc blocks |
| Prefer soft deletion for financial records | Hard-delete audit trail data |
