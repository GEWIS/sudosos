<div align="center">

[![Build](https://img.shields.io/github/actions/workflow/status/GEWIS/sudosos-frontend/semver.yml?branch=main&label=Build)](https://github.com/GEWIS/sudosos-frontend/actions/workflows/semver.yml)
[![Latest Release](https://img.shields.io/github/v/tag/GEWIS/sudosos-frontend?label=Latest)](https://github.com/GEWIS/sudosos-frontend/releases)
[![Issues](https://img.shields.io/github/issues/GEWIS/sudosos-frontend)](https://github.com/GEWIS/sudosos-frontend/issues)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/GEWIS/sudosos-frontend)](https://github.com/GEWIS/sudosos-frontend/commits/main)
[![Code Size](https://img.shields.io/github/languages/code-size/GEWIS/sudosos-frontend)](https://github.com/GEWIS/sudosos-frontend)

</div>

# SudoSOS Frontend Monorepo

This monorepo contains all the frontend projects and common code for the SudoSOS.

## Projects

1. **sudosos-nginx-proxy**: Nginx proxy configuration for the SudoSOS stack.
2. **sudosos-frontend-common**: Common code components, helper functions, services, and Pinia stores for frontend applications.
3. **sudosos-point-of-sale**: Frontend application for the SudoSOS POS system built with Vue 3 and TypeScript.
4. **sudosos-dashboard**: Dashboard frontend application for SudoSOS, rewritten in Vue 3.

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue on the [issue tracker](https://github.com/GEWIS/sudosos-frontend/issues).

## Development quick start

You can quickly start development directly in your browser by using [Codespaces](https://github.com/features/codespaces). Otherwise you can use a local code editor such [Jetbrains Webstorm](https://www.jetbrains.com/webstorm/) (free via the university) or [VSCode](https://code.visualstudio.com/).

### GitHub Codespaces

#### Step 1: Setting up the environment
- [Click here to create a codespace for this repository](https://github.com/codespaces/new/GEWIS/sudosos-frontend)
- After this, all of the dependencies, development environment and set up command should be run and ready.

#### Step 2: Launching dashboard/point-of-sale
- Run `cd apps/dashboard` or `cd apps/point-of-sale` in the terminal. 
- Run `npm run dev` to start the development environment.
- There should be a pop up to open the website in the bottom right corner, changes to the code are directly reflected on this site.
- You can also open this site using the ports tab in the same window as the terminal.

> [!WARNING]
> Login via GEWIS does not work on Codespaces, you will need to sign in using your m-account in the local login.

> [!TIP]
> You can also use the Jetbrains IDE if you prefer that over the default Codespaces IDE. [More information can be found here.](https://docs.github.com/en/codespaces/developing-in-a-codespace/using-github-codespaces-in-your-jetbrains-ide)


### Local set up
#### Step 0: Prerequisites
- [Node.js Version 18+](https://nodejs.org)
- [Git](https://www.git-scm.com/) and possibly a Git manager 
- (VSCode: [Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar))

#### Step 1: Installing
- Use git to [clone](https://github.com/git-guides#how-do-i-use-git) the repository.
- Run `npm install`
- Copy the .env.example file to .env in the `apps/dashboard` and `apps/point-of-sale` directories

#### Step 2: Running the dashboard/point-of-sale
- Run `cd apps/dashboard` or `cd apps/point-of-sale` in the terminal. 
- Run `npm run dev` to start the development environment.
- You can access the dashboard and point of sale at `localhost:5173` and `localhost:5174` respectively.

### Set up browser for CORS
By default no network requests are allowed from other hosts to `sudosos.test.gewis.nl`. This will prevent critical network requests like authentication from working correctly. To allow this, CORS will need to be disabled. This can be done by using an [extension](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/) that can disable CORS. Alternatively, if you are using chrome, [you can directly run it without CORS](https://stackoverflow.com/questions/3102819/disable-same-origin-policy-in-chrome).
