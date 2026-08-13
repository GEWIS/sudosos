# @gewis/sudosos-client

Auto-generated TypeScript-Axios client for the SudoSOS API. Published on npm as [`@gewis/sudosos-client`](https://www.npmjs.com/package/@gewis/sudosos-client).

This package lives at `packages/sudosos-client/` in the [GEWIS/sudosos](https://github.com/GEWIS/sudosos)
monorepo and is generated from the backend's Swagger/OpenAPI spec. The frontend apps in this same repo
consume it directly as a `workspace:*` dependency, not via the npm-published version.

---

## Installation

```bash
npm install @gewis/sudosos-client
# or
yarn add @gewis/sudosos-client
```

---

## Usage

### Unauthorized API usage

```typescript
import { BannersApi, Configuration } from '@gewis/sudosos-client';

const configuration = new Configuration({
  basePath: 'https://sudosos.gewis.nl/api/v1',
});

const bannersApi = new BannersApi(configuration);
bannersApi.getAllOpenBanners().then((res) => {
  console.log(res.data);
});
```

### Authorized API usage

All API methods accept a single object parameter (named properties, no positional `undefined` placeholders needed).

```typescript
import { AuthenticateApi, BalanceApi, Configuration } from '@gewis/sudosos-client';

const basePath = 'https://sudosos.gewis.nl/api/v1';
const configuration = new Configuration({ basePath });

// Authenticate with an API key
const { data } = await new AuthenticateApi(configuration).keyAuthentication({
  keyAuthenticationRequest: { key: 'API_KEY', userId: 0 },
});
const jwtToken = data.token;

// Use the token for authenticated requests
const authedConfig = new Configuration({
  basePath,
  accessToken: () => jwtToken,
});

const balanceApi = new BalanceApi(authedConfig);
balanceApi.getBalances().then((res) => {
  console.log(res.data);
});
```

For a more complete integration example, see [`frontend/lib/common`](../../frontend/lib/common) in this repo.

---

## How the client is generated

The client is generated from the OpenAPI spec that the backend emits at build time (`out/swagger.json`). The generator is [`openapi-generator-cli`](https://openapi-generator.tech/) using the `typescript-axios` template with `useSingleRequestParameter=true`.

### Prerequisites

- Node.js 22+
- Java 11+ runtime (required by `openapi-generator-cli`) — only needed to *regenerate* the client;
  the generated `src/` is committed, so day-to-day frontend work never needs Java.
- The backend's Swagger output must exist at `../../backend/out/swagger.json` — run `pnpm backend:swagger`
  from the repo root first (or `pnpm swagger` from `backend/`).

### Common commands

Run from this directory (`packages/sudosos-client/`) once the monorepo workspace is installed, or via
`pnpm --filter @gewis/sudosos-client <script>` from anywhere in the repo:

| Command | Description |
|---|---|
| `pnpm gen` | Generate TypeScript source from `../../backend/out/swagger.json` into `src/` |
| `pnpm build` | Compile `src/` to `dist/` (CJS) and `dist/esm/` (ESM, for bundler consumers) |
| `pnpm genbuild` | Run `gen` then `build` (full regeneration) |
| `pnpm clean` | Remove `src/` and `dist/` |

### Regenerating after a backend change

One-shot, from the repo root:

```bash
pnpm generate:client   # runs backend swagger, then this package's genbuild
```

Or step by step:

```bash
pnpm backend:swagger                              # produces backend/out/swagger.json
pnpm --filter @gewis/sudosos-client run genbuild   # regenerate + rebuild the client
```

---

## Contributing

This package is generated — do not edit files under `src/` by hand; they will be overwritten on the next
`pnpm gen`. To change the client's output, update the backend API and regenerate.

Issues and contributions go through the [GEWIS/sudosos issue tracker](https://github.com/GEWIS/sudosos/issues).
