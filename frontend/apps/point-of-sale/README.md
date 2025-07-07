# sudosos-point-of-sale

Frontend application for the SudoSOS point of sale (POS) system.

## Description

This is the frontend for the SudoSOS POS system, built with Vue 3 and TypeScript. It now lives inside the [`sudosos-frontend`](https://github.com/GEWIS/sudosos-frontend) monorepo at `./apps/point-of-sale`.

## Target Devices & Screen Sizes

Our main focus for usability and testing is on these two device profiles:

- **Tablet:** `1333 x 800` (CSS pixels, Galaxy Tab S6 Lite effective viewport)
- **POS Screen:** `1280 x 1024` (CSS pixels)

Make sure to check your layouts at these sizes for best results.

## Prerequisites

- **Node.js 22+** ([Download](https://nodejs.org/))
- **Yarn** (with corepack enabled) ([Download](https://yarnpkg.com/getting-started/install))

## Getting Started

From the root of the monorepo:

```bash
git clone https://github.com/GEWIS/sudosos-frontend.git
yarn install
yarn dev-pos
```

This will start the POS app along with its dependencies (common libraries) in development mode.

## Building

To create a production build:

```bash
yarn build-pos
```

The built files will be output to `apps/point-of-sale/dist/`.

### Advanced/Direct usage (not recommended):

If you want to run only the POS app (for example, if you know your libraries are already built and up-to-date):

```bash
cd apps/point-of-sale
yarn dev
```

**Production build:**

```bash
cd sudosos-frontend
yarn build-pos
```

Or, from the app directory:

```bash
cd apps/point-of-sale
yarn build
```

Built files will be in `dist/`.

**Preview production build:**

```bash
cd apps/point-of-sale
yarn preview
```

## Contributing

Issues and pull requests are welcome! Use the [main repo issue tracker](https://github.com/GEWIS/sudosos-frontend/issues) for feedback or suggestions.
