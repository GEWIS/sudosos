<div align="center">

<!-- Centered Logo Image -->
<img src="https://github.com/GEWIS/sudosos-frontend/blob/develop/apps/dashboard/src/assets/img/bier.png?raw=true" alt="Logo" style="width:200px;height:auto;">

<!-- Centered Name Beneath Logo -->
<h1>SudoSOS Frontend Monorepo</h1>

[![Uptime](https://uptime.gewis.nl/api/badge/2/uptime)](https://sudosos.gewis.nl/api/v1/ping)
[![Build](https://img.shields.io/github/actions/workflow/status/GEWIS/sudosos-frontend/semver.yml?branch=main&label=Build)](https://github.com/GEWIS/sudosos-frontend/actions/workflows/semver.yml)
[![Latest Release](https://img.shields.io/github/v/tag/GEWIS/sudosos-frontend?label=Latest)](https://github.com/GEWIS/sudosos-frontend/releases)
[![Issues](https://img.shields.io/github/issues/GEWIS/sudosos-frontend)](https://github.com/GEWIS/sudosos-frontend/issues)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/GEWIS/sudosos-frontend)](https://github.com/GEWIS/sudosos-frontend/commits/main)
[![Code Size](https://img.shields.io/github/languages/code-size/GEWIS/sudosos-frontend)](https://github.com/GEWIS/sudosos-frontend)

</div>

This monorepo contains all the frontend projects and common code for the SudoSOS.

## Projects

1. **sudosos-nginx-proxy**: Nginx proxy configuration for the SudoSOS stack.
2. **sudosos-frontend-common**: Common code components, helper functions, services, and Pinia stores for frontend applications.
3. **sudosos-themese**: Primevue themes for the SudoSOS frontend.
4. **sudosos-point-of-sale**: Frontend application for the SudoSOS POS system built with Vue 3 and TypeScript.
5. **sudosos-dashboard**: Dashboard frontend application for SudoSOS, rewritten in Vue 3.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue on the [issue tracker](https://github.com/GEWIS/sudosos-frontend/issues).

## Development quick start

You can quickly start development directly in your browser by using [Codespaces](https://github.com/features/codespaces). Otherwise you can use a local code editor such [Jetbrains Webstorm](https://www.jetbrains.com/webstorm/) (free via the university) or [VSCode](https://code.visualstudio.com/).

### GitHub Codespaces

#### Step 1: Setting up the environment

- [Click here to create a codespace for this repository](https://github.com/codespaces/new/GEWIS/sudosos-frontend)
- After this, all of the dependencies, development environment and set up command should be run and ready.

#### Step 2: Launching dashboard/point-of-sale

- Run `yarn dev-dashboard` or `yarn dev-pos` to start the development environment.
- There should be a pop up to open the website in the bottom right corner, changes to the code are directly reflected on this site.
- You can also open this site using the ports tab in the same window as the terminal.

> [!WARNING]
> Login via GEWIS does not work on Codespaces, you will need to sign in using your m-account in the local login.

> [!TIP]
> You can also use the Jetbrains IDE if you prefer that over the default Codespaces IDE. [More information can be found here.](https://docs.github.com/en/codespaces/developing-in-a-codespace/using-github-codespaces-in-your-jetbrains-ide)

> [!TIP]
> Use `yarn dev-dashboard:local`, `yarn dev-dashboard:test`, or `yarn dev-dashboard:prod` to switch between backends. The test and prod environments correspond to `sudosos.test.gewis.nl` and `sudosos.gewis.nl`, respectively. The local option is for running your own backend.

### Local set up

#### Step 0: Prerequisites

- [Node.js Version 18+](https://nodejs.org)
- [Git](https://www.git-scm.com/) and possibly a Git manager
- (VSCode: [Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar))
- Yarn version 4 (enable this by running `corepack enable && yarn set version berry` after installing node)

#### Step 1: Installing

- Use git to [clone](https://github.com/git-guides#how-do-i-use-git) the repository.
- Run `yarn install`
- Copy the `.env.example` file to `.env` file in the `apps/dashboard` and `apps/point-of-sale` directories
- Run `yarn build-libraries` to have the SudoSOS libraries also ready

#### Step 2: Running the dashboard/point-of-sale

- Run `yarn dev-dashboard` or `yarn dev-pos` to start the development environment.
- You can access the dashboard and point of sale at `localhost:5173` and `localhost:5174` respectively.

### Short note on ESLint and Prettier

We use linting and prettier throughout the project, these are an extension on the [central JS-Configs](https://github.com/GEWIS/js-configs).
You can check this by running `yarn lint` and `yarn format` (in the root for all packages, or in each package).
Some lint issues can be fixed by running `yarn lint-fix`, but some require manual work. All prettier can be fixed using `yarn format-fix`.
This will also be enforced by the CI on GitHub when creating a pull request.

### Proxying requests to different backends

You can switch between different backends in development using the following yarn commands:

**For Dashboard:**

- `yarn dev-dashboard` or `yarn dev-dashboard:test` - Uses the test backend (`https://sudosos.test.gewis.nl/api/v1`) - **default**
- `yarn dev-dashboard:prod` - Uses the production backend (`https://sudosos.gewis.nl/api/v1`)
- `yarn dev-dashboard:local` - Uses a local backend (`http://localhost:3000`)

**For Point of Sale:**

- `yarn dev-pos` or `yarn dev-pos:test` - Uses the test backend (`https://sudosos.test.gewis.nl/api/v1`) - **default**
- `yarn dev-pos:prod` - Uses the production backend (`https://sudosos.gewis.nl/api/v1`)
- `yarn dev-pos:local` - Uses a local backend (`http://localhost:3000`)

## Contributors

This project exists thanks to all the people who contribute code.

[//]: # 'TODO create a CONTRIBUTING.md'
[//]: # "If you'd like to help, see [our guide to contributing code](CONTRIBUTING.md)."

<a href="https://github.com/GEWIS/sudosos-frontend/graphs/contributors"><img src="https://contributors.aika.dev/GEWIS/sudosos-frontend/contributors.svg?max=44" alt="Code contributors" /></a>
