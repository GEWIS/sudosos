# SudoSOS — Claude Code Guidelines

**Last updated:** 2026-04-23

**Monorepo layout:**
- `backend/` — Express API, TypeORM, RBAC, TypeScript.
- `frontend/apps/dashboard/` — Admin/seller dashboard (Vue 3, PrimeVue, Pinia).
- `frontend/apps/point-of-sale/` — POS kiosk app.
- `frontend/lib/common/`, `frontend/lib/themes/` — shared frontend libraries.
- `packages/sudosos-client/` — generated API client (`@gewis/sudosos-client`), published to npm.

---

## Quickstart

```bash
pnpm bootstrap      # install, env files, JWT key, build libs, seed dev DB
pnpm dev            # backend :3000 + dashboard :5173
pnpm dev:pos        # POS :5174
```

Dev logins (from `pnpm bootstrap`'s seed): `admin@sudosos.nl` / `admin` / PIN `0000`, `user@sudosos.nl` / `user` / PIN `1111`.

---

## What is SudoSOS?

SudoSOS is GEWIS' point-of-sale and internal financial system. It records purchases, deposits, invoices, payouts, and the audit trail around them. Full domain documentation lives in `backend/docs/content/general/`.

---

## GitHub / PR Workflow

- **PR titles**: PR titles are displayed on a screen in a GEWIS room, so they must be **short, human-readable, and complete on their own**. Do **not** use conventional-commit prefixes (`feat:`, `chore:`, etc.) — those belong in commit messages, not PR titles. Start with an imperative verb and write a plain sentence.
  - ❌ `chore: remove deprecated non-PoS token endpoints`
  - ✅ `Remove deprecated non-PoS token endpoints`
- **Do not reply to Copilot review comments** — they are automated feedback. Address findings by fixing code. Only reply to human reviewers.
- **Resolving Copilot threads**: **Always resolve every Copilot thread after triage** — addressed, hallucination, or skipped nitpick. Copilot is automated noise; we never reply to it, so an open thread communicates nothing and just clutters the review. Resolve via the GitHub GraphQL API — never via `add_reply_to_pull_request_comment`. Use:
  ```bash
  gh api graphql -f query='mutation { resolveReviewThread(input: { threadId: "<THREAD_NODE_ID>" }) { thread { isResolved } } }'
  ```
  Thread node IDs (e.g. `PRRT_kwDOJ75ivs50YLQG`) come from `get_review_comments` — the `ID` field on each `reviewThread`.
- **PR template checklist**: Check each item `[x]` if completed or not applicable. Leave `[ ]` only if it genuinely still needs work.
  - For docs-only PRs: all three items can be `[x]` (no new tests needed, docs are the change, no DB migration).

### Handling PR Feedback

When asked to "go over PR feedback" or "handle PR comments":

1. **Switch to the branch and pull** — `git switch <branch> && git pull` so you have the latest remote state.
2. **Read all review comments** via GitHub MCP (`pull_request_read` with `get_review_comments`).
3. **Triage each comment critically** — Copilot can hallucinate or give bad advice. For each comment decide:
   - **Valid & useful** → apply the fix.
   - **Wrong / hallucinating** → ignore (do not reply to Copilot).
   - **Nitpick but correct** → apply if trivial, skip if noisy.
   - **Out of scope** → skip (pre-existing patterns unrelated to this PR).
4. **Apply fixes into the correct original commits** — do NOT create a new `fix: apply PR review feedback` commit. Instead, amend the commit where the issue was introduced. A PR should read as a clean story; review feedback is rewriting that story, not appending errata. See [Commit history philosophy](#commit-history-philosophy) below.
5. **Verify**: `pnpm backend:lint && pnpm --filter sudosos-backend exec tsc --noEmit` (backend) or `pnpm frontend:lint && pnpm --filter sudosos-dashboard exec vue-tsc --noEmit -p tsconfig.app.json` (frontend).
6. **Force-push** with `--force-with-lease` to the remote branch.
7. **Resolve every Copilot thread** via `gh api graphql` (`resolveReviewThread` mutation) — addressed, hallucinated, or skipped. Do **not** use `add_reply_to_pull_request_comment` for Copilot threads — resolve only, no reply. For human reviewer comments, reply with a short "Addressed — <what changed>" message, then the maintainer resolves their threads.

---

## Git Workflow

- **Always branch from `develop`** (not `main`).
- **PR base branch**: Always `develop`.
- **Branch naming**: `feat/`, `fix/`, `refactor/`, `chore/`, `docs/` prefixes matching semantic commits.
- **Commit messages**: Use semantic prefixes (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, etc.).
- **Rebase, always.** Never merge commits. Rebase is the only true git approach.

### Commit history philosophy

A PR's commit history should tell a clean, logical **story**. Each commit is a self-contained, purposeful step. History can and should be rewritten to maintain this.

**The rule:** if a later change logically belongs to an earlier commit, amend that commit — don't add a new one.

Example of a **clean** PR history:
```
feat: add user export endpoint
test: add user export tests
docs: document user export API
```

If PR review finds a bug in the `feat` commit, or you realize you missed an edge case — **amend the `feat` commit**, don't append `fix: address PR feedback`. The final history should look identical to the list above, just with better code inside.

Same principle applies during development: if you wrote a `feat` commit, then a `test` commit, then realize the `feat` commit has a bug — go back and fix it in the `feat` commit, not as a new commit.

### Rewriting history without interactive rebase

Since `git rebase -i` requires interactive input, use these non-interactive patterns:

**Amend the most recent commit:**
```bash
git add <files>
git commit --amend --no-edit
```

**Amend an older commit (e.g. 3 commits back):**
```bash
# 1. Create a fixup commit
git add <files>
git commit --fixup=<target-commit-sha>

# 2. Auto-squash it into the target commit
GIT_SEQUENCE_EDITOR=true git rebase --autosquash --autostash <target-commit-sha>~1
```

The `GIT_SEQUENCE_EDITOR=true` trick skips the interactive editor — it accepts the auto-generated rebase plan as-is, which is exactly what `--autosquash` needs.

**Squash all commits into one:**
```bash
git reset --soft HEAD~N   # undo N commits, keep changes staged
git commit -m "new combined message"
```

### Force-push safely

**Always use `--force-with-lease`** over `--force`. This flag refuses if the remote has commits you haven't seen, preventing accidental overwrites of others' work.

---

## Environment Setup

**One package manager: `pnpm`.** Install only at the repo root — never run `npm install` or `yarn` anywhere in this tree.

```bash
pnpm install              # root only, once (or via pnpm bootstrap)
pnpm backend:test          # backend full suite
pnpm backend:lint          # backend eslint
pnpm backend:build         # backend tsc
pnpm frontend:lint         # all frontend workspaces
pnpm frontend:build        # client + libs + apps, in topo order
pnpm generate:client       # regenerate @gewis/sudosos-client from the current backend swagger
                           #   (needs Java 11+ — only run this when the backend API changed;
                           #   the generated src/ is committed, so day-to-day work never needs Java)
pnpm --filter <pkg> <script>   # anything narrower than the above
```

The shell auto-loads nvm; `.nvmrc` pins Node 22. If a command ever fails with "not found": `source ~/.zshrc`.

---

## Code Quality Checklist

Before committing:

- [ ] Run the linter (`pnpm lint` for the whole repo, or `pnpm backend:lint` / `pnpm frontend:lint`).
- [ ] Check for cascading import cleanup when removing an export (e.g., removing `UserType` from a named import may leave `User` unused too).
- [ ] Watch for duplicate import statements from the same module.
- [ ] Type-check: `pnpm --filter sudosos-backend exec tsc --noEmit` (backend) or `pnpm --filter sudosos-dashboard exec vue-tsc --noEmit -p tsconfig.app.json` (frontend apps — swap the filter for `@sudosos/point-of-sale` as needed).

---

## Agent Environment Notes

### What works

- `pnpm` (the only package manager in this repo)
- `git push` / `git fetch` / `git clone`
- `pnpm lint` (ESLint, backend + frontend)
- `pnpm format` / `pnpm format:fix` (Prettier, frontend)
- `pnpm --filter <pkg> exec tsc --noEmit` / `vue-tsc --noEmit`
- `pnpm backend:test` (backend full suite)

### Native modules

- **`bcrypt` and other native modules** compiled for macOS cannot run in a Linux VM environment.
  - **Workaround**: Use `tsc --noEmit` and `pnpm backend:lint` for verification. Full test suite must run on your machine or in CI.

### Stale `.git/index.lock`

If a previous git operation crashed, `.git/index.lock` blocks all git commands. Recovery:

```bash
rm .git/index.lock
```

Safe to remove if no git process is running.

---

## Documentation Conventions

When editing docs in `backend/docs/content/`:

- Write short sentences. Prefer concrete nouns (name the controller/service/entity).
- Use the same domain terms everywhere: "transaction", "transfer", "balance", "revision", "point of sale", "container".
- Tie claims to something verifiable: an endpoint, an entity, a file path.
- **`@typedef` JSDoc blocks are load-bearing for Swagger generation** — never remove them from entity files.

---

## Backend-Specific Patterns

See **[backend/CLAUDE.md](./backend/CLAUDE.md)** for:

- Domain model recap (with links to full docs)
- Architecture conventions (service layer, controller layer, entity access, RBAC)
- Testing patterns (env vars, seeding, known failures)
- JSDoc & Swagger conventions
- CLI entry points and the `src/` → `test/` import rule
- Redis/ioredis patterns
- Dockerfile best practices
- Domain-specific gotchas

## Frontend-Specific Patterns

See **[frontend/CLAUDE.md](./frontend/CLAUDE.md)** for:

- Vue composable and component patterns
- PrimeVue conventions (global registration, confirm dialogs)
- Pinia store patterns and API client bumps
- i18n/locale handling
- WebSocket token management
- Prettier & `.editorconfig` line-ending pitfalls
- View mode toggle pattern
