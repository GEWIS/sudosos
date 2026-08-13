# sudosos-point-of-sale

Frontend application for the SudoSOS point of sale (POS) system.

## Description

This is the frontend for the SudoSOS POS system, built with Vue 3 and TypeScript. It lives inside the
[GEWIS/sudosos](https://github.com/GEWIS/sudosos) monorepo at `frontend/apps/point-of-sale`.

## Target Devices & Screen Sizes

Our main focus for usability and testing is on these two device profiles:

- **Tablet:** `1333 x 800` (CSS pixels, Galaxy Tab S6 Lite effective viewport)
- **POS Screen:** `1280 x 1024` (CSS pixels)

Make sure to check your layouts at these sizes for best results.

## Prerequisites

- **Node.js 22+** ([Download](https://nodejs.org/))
- **pnpm** (with corepack enabled) — installs happen at the monorepo root, not in this directory.

## Getting Started

From the root of the monorepo:

```bash
git clone git@github.com:GEWIS/sudosos.git && cd sudosos
pnpm bootstrap
pnpm dev:pos
```

This starts the POS app along with its dependencies (the shared libraries) in development mode.

## Building

To create a production build, from the repo root:

```bash
pnpm --filter @gewis/sudosos-client build && pnpm --filter @sudosos/themes build && pnpm --filter @sudosos/sudosos-frontend-common build
pnpm --filter @sudosos/point-of-sale build
```

The built files will be output to `frontend/apps/point-of-sale/dist/`.

### Advanced/Direct usage (not recommended)

If you want to run only the POS app (for example, if you know the shared libraries are already built
and up-to-date), you can run its own scripts directly from this directory once the workspace is
installed:

```bash
cd frontend/apps/point-of-sale
pnpm dev:local     # dev server against a local backend
pnpm build          # production build -> dist/
pnpm preview        # preview the production build
```

## Contributing

Issues and pull requests are welcome! Use the
[monorepo issue tracker](https://github.com/GEWIS/sudosos/issues) for feedback or suggestions.
