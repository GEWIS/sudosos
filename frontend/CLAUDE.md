# SudoSOS Frontend — Agent Patterns & Conventions

**Last updated:** 2026-05-07

This file documents frontend-specific patterns. For general project guidelines see [../CLAUDE.md](../CLAUDE.md).

---

## Project Structure

**pnpm workspace (part of the monorepo root workspace, not a separate lockfile):**

```
frontend/
├── apps/
│   ├── dashboard/            # Admin/seller dashboard
│   │   └── src/{composables, components, stores, pages, locales}
│   └── point-of-sale/        # POS kiosk app (same structure)
├── lib/
│   ├── common/               # Shared utilities, types, Pinia stores, API client
│   └── themes/               # Shared PrimeVue themes
├── .editorconfig             # Line endings — must be end_of_line = lf
└── .prettierrc               # inherited from root .prettierrc.js (@gewis/prettier-config)
```

---

## Environment & Tools

**Use `pnpm`, NOT `yarn` or `npm`.** Install only at the repo root.

| Old (yarn, pre-monorepo)          | New (pnpm, from repo root)                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------------- |
| `yarn install`                    | `pnpm install`                                                                                |
| `yarn dev-dashboard:local`        | `pnpm dev:dashboard`                                                                          |
| `yarn dev-pos:local`              | `pnpm dev:pos`                                                                                |
| `yarn build-libraries`            | `pnpm --filter @sudosos/themes build && pnpm --filter @sudosos/sudosos-frontend-common build` |
| `yarn lint` / `yarn lint-fix`     | `pnpm frontend:lint` / `pnpm --filter './frontend/**' lint-fix`                               |
| `yarn build`                      | `pnpm frontend:build`                                                                         |
| `yarn format` / `yarn format-fix` | `pnpm format` / `pnpm format:fix`                                                             |

### Type Checking

Type-check **specific apps only**, not the root:

```bash
# ✅ Correct
pnpm --filter sudosos-dashboard exec vue-tsc --noEmit -p tsconfig.app.json
pnpm --filter @sudosos/point-of-sale exec vue-tsc --noEmit -p tsconfig.app.json

# ❌ Wrong — lib/common has pre-existing errors not checked by build
tsc --noEmit
```

---

## Key Rules

### PrimeVue Components Are Global

All PrimeVue components (`DataTable`, `Column`, `Button`, `ConfirmDialog`, etc.) are globally registered in `main.ts`. **Never import them locally** — it works but is redundant and will draw a review comment.

### `ConfirmDialog` Placement

Render `<ConfirmDialog :group="groupName" />` **once outside** loops/tables. If multiple instances can be mounted simultaneously (accordion panels), scope the group: `computed(() => \`delete-${props.entity.id}\`)`.

### i18n — Search Before Creating

Locale files live in `apps/*/src/locales/` (EN, NL, PL). **Always grep before inventing a key:**

```bash
grep -r "productContainer" apps/dashboard/src/locales/
```

### Lockstep Deployment

Lockstep is now structural: backend and frontend ship from the same repo on the same release train (one `vX.Y.Z` tag versions both), so a frontend change landing ahead of its backend dependency is a single-PR sequencing problem, not a cross-repo release coordination one. Still call out in the PR description if a change depends on backend work that hasn't landed on the same branch yet.

### The API client comes from the workspace, not npm

`@gewis/sudosos-client` is `packages/sudosos-client` in this repo (`workspace:*`), not a version bumped in `package.json` from npm. If the backend API changed, regenerate it (`pnpm generate:client`, needs Java 11+) instead of waiting for a published bump.

---

## Point of Sale App: Auth Model & Local Configure-POS Bypass

The `point-of-sale` app uses **two separate tokens**, both stored via `lib/common/src/helpers/TokenHelper.ts` as `{ token, expires }` JSON:

- **User token** -- default key `jwt_token`. Identifies the human operator. Set when a user logs in (PIN/NFC/EAN on the keypad).
- **POS token** -- key `pos_jwt_token` (`usePosToken.ts`). A `POINT_OF_SALE`-type token identifying which till this device is. `setTokenInStorage` **throws** if a `pos_jwt_token` value lacks `user.pointOfSale`.

### Router gating (`apps/point-of-sale/src/router/index.ts` `beforeEach`)

- No `pos_jwt_token` -> redirect to `configure-pos` (the `NoPosTokenView` QR screen).
- `pos_jwt_token` present but no user token -> redirect to `login` (the PIN keypad). **This is the normal ready state for a configured till** -- it's where the operator enters their PIN.
- Both present -> `/cashier` is reachable (also guarded by `authGuard` + `posTokenGuard`).

### The real configure flow (production)

`NoPosTokenView.vue` shows a QR code. The QR encodes `<frontendUrl>/auth/qr/confirm?sessionId=...`. An already-authenticated user opens it, the dashboard POSTs `/authentication/qr/{sessionId}/confirm`, the backend emits `qr-confirmed` over websocket, and `useQrAuth.ts` puts the resulting user token on the device. The user then selects a POS (`usePointOfSaleSwitch.switchToPos` -> `GET /authentication/pointofsale/{id}` -> `pos_jwt_token`). The QR step exists only to get a token onto a device that has no credentials of its own.

### Bypassing configure-pos in local dev

Skip the QR/websocket dance entirely -- mint the POS token directly and plant it:

1. `POST /v1/authentication/local` `{"accountMail":"admin@sudosos.nl","password":"admin"}` -> admin JWT.
2. `GET /v1/authentication/pointofsale/{id}` with `Authorization: Bearer <admin JWT>` (dev seed: POS id `1` = "Bar", `useAuthentication: true`) -> a `POINT_OF_SALE` token.
3. In the preview page, store it the way `parseToken` expects and reload:

   ```js
   const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
   localStorage.setItem('pos_jwt_token', JSON.stringify({ token, expires: String(payload.exp) }));
   window.location.href = window.location.origin + '/cashier';
   ```

This lands on the PIN login page for the configured till. To go further into `/cashier`, also set a user token under `jwt_token` (or just log in on the keypad -- see below).

### Logging in on the keypad (local dev)

The keypad takes a user id, then a 4-digit PIN. The fastest path is keyboard mode: press `Escape` to enable it (you'll see a toast), then type the sequence. Local accounts (admin/user) use the external path, so prefix with `e`; GEWIS members type their member id with no prefix.

- **Admin:** `Escape`, `e`, `1`, `Enter`, `0`, `0`, `0`, `0`. `Enter` switches from the user-id field to the PIN field; the PIN auto-submits and you land on `/cashier`.

Dev PINs: admin `0000` (id 1), user `1111`, members alice `1234` / bob `5678`.

---

## Embedding Screenshots in PR Descriptions

The PR template requires comparison screenshots for UI changes. **Upload to GitHub's user-attachments storage** — the same destination you get from drag-dropping into the PR description editor. Don't commit screenshots into the repo; they pollute git history with binaries.

GitHub doesn't expose a public REST API for user-attachments uploads (the `https://uploads.github.com/repos/<o>/<r>/issues/<n>/attachments` endpoint exists but rejects PAT auth with `Bad Size`). The only reliable path is to drive a signed-in browser via Chrome MCP.

**Effort budget:** only follow the full Chrome MCP flow below when it's smooth — Chrome MCP is connected, the browser is already signed in to github.com, and the editor opens cleanly on the first try. If anything fights you (extension offline, browser not signed in, drop event silently no-ops), **stop and just ask the user to drop the screenshot in themselves** — tell them the file path (`/tmp/sudosos-<short-id>.png`) and the PR URL. A 10-second manual drop beats five minutes of automation debugging, and the user-attachments URL ends up identical either way.

### Workflow

1. **Make the UI state visible.** If the screenshot needs an authenticated/conditional state (modals, error banners, empty states), apply a **preview-only patch** to force the component visible, then revert before committing. Mark the diff with `// PREVIEW-ONLY` so it's obvious if it slips through.

2. **Start the dev server** via `preview_start` (server name from `.claude/launch.json` — `pos` or `dashboard`).

3. **Capture with headless Chrome** — produces a PNG file (the `preview_screenshot` MCP tool returns inline only; it can't write to disk):

   ```bash
   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
     --headless=new --disable-gpu \
     --virtual-time-budget=5000 \
     --hide-scrollbars \
     --window-size=1280,1024 \
     --screenshot=/tmp/sudosos-<short-id>.png \
     http://localhost:5174/
   ```

   - `--headless=new` — the legacy `--headless` mode mis-measures heights inside PrimeVue `Message`/`Dialog` and clips text. Always use `--headless=new`.
   - `--virtual-time-budget=5000` — gives Vue/PrimeVue's mount + transition animations time to settle before the snapshot.
   - Tune `--window-size` if the dialog gets clipped. POS dialogs usually fit in 1280x1024; cross-check against `preview_screenshot` (the MCP tool's inline image) to confirm the headless render matches the real browser.

4. **Revert preview-only patches** and verify with `vue-tsc` + `pnpm frontend:lint`.

5. **Upload to user-attachments via Chrome MCP.** Confirm Chrome MCP is connected (`mcp__Claude_in_Chrome__list_connected_browsers`) and the browser is signed in to github.com.

   ```js
   // In a chrome MCP javascript_tool call, on the PR page with the description editor open:
   // 1. Open the editor: click "..." on the PR description → "Edit"
   // 2. Inject the file. Browsers can't read /tmp directly via fetch, so either:
   //    a) Fetch a previously-uploaded copy of the same image (e.g. from raw.githubusercontent.com), OR
   //    b) Embed the file as base64 in the JS body (works up to ~100KB).
   //    Option (a), via fetch:
   const res = await fetch('https://raw.githubusercontent.com/<owner>/<repo>/<sha>/<path>.png');
   const blob = await res.blob();
   const file = new File([blob], 'screenshot.png', { type: 'image/png' });
   const ta = document.getElementById('issue-<NUM>-body'); // textarea in PR description editor
   const dt = new DataTransfer();
   dt.items.add(file);
   const r = ta.getBoundingClientRect();
   ['dragenter', 'dragover', 'drop'].forEach((t) =>
     ta.dispatchEvent(
       new DragEvent(t, {
         bubbles: true,
         cancelable: true,
         dataTransfer: dt,
         clientX: r.left + 50,
         clientY: r.top + 50,
       }),
     ),
   );
   ```

   - GitHub auto-uploads the file and inserts an `<img src="https://github.com/user-attachments/assets/<uuid>" />` tag at the cursor.
   - Note: `mcp__Claude_in_Chrome__file_upload` returns `Not allowed` against GitHub's hidden file inputs — don't waste time on it. The drop-event approach above is the working path.

6. **Tidy the textarea** with another `javascript_tool` call: remove any auto-inserted `<img>` you don't want, and rewrite the desired one with `width="800"` and a clearer `alt`. Use the native `HTMLTextAreaElement.prototype.value` setter so React/CodeMirror picks up the change:

   ```js
   const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
   setter.call(ta, newValue);
   ta.dispatchEvent(new Event('input', { bubbles: true }));
   ```

7. **Click "Update comment"** to save (`find` for the button, then click).

8. **Verify** via `gh pr view <num> --json body -q '.body' | grep src=` that only the `user-attachments` URL is present, no `raw.githubusercontent.com` leftovers.

---

## Do / Don't

| ✅ Do                                            | ❌ Don't                                           |
| ------------------------------------------------ | -------------------------------------------------- |
| Use PrimeVue components from global registration | Import PrimeVue locally in components              |
| Reload from server after API mutations           | Read stale form/vee-validate state after mutations |
| Use `getToken` callback for socket.io auth       | Capture auth token statically (stale on reconnect) |
| Run `pnpm format` to verify CI compliance        | Run `pnpm format:fix` to verify (always exits 0)   |
| Search locale files before adding i18n keys      | Invent new keys without checking existing ones     |
| Type-check with `vue-tsc -p tsconfig.app.json`   | Run `tsc --noEmit` on the monorepo root            |
| Use `end_of_line = lf` in `.editorconfig`        | Use `crlf` (breaks CI on Linux)                    |
