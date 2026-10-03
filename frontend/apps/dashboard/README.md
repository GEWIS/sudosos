# sudosos-dashboard

This is the admin/seller dashboard, rewritten in Vue 3. It's the website you see when you go to
sudosos.gewis.nl. It lives at `frontend/apps/dashboard/` inside the
[GEWIS/sudosos](https://github.com/GEWIS/sudosos) monorepo — see the [root README](../../../README.md)
for the one-command setup (`pnpm bootstrap && pnpm dev`).

## Recommended IDE Setup

We recommend using [Jetbrains Webstorm](https://www.jetbrains.com/webstorm/) for this project, or
VS Code with the official [Vue extension](https://marketplace.visualstudio.com/items?itemName=Vue.volar).

## Project Setup

This package manager is **pnpm**, not npm or yarn, and installs happen at the repo root (one workspace,
one lockfile) — see the [root README](../../../README.md#quickstart) rather than running `npm install`
here directly. Copy `.env.example` to `.env` in this directory before starting the dev server.

From the repo root:

```sh
pnpm dev:dashboard   # or `pnpm dev` for backend + dashboard together
```

From this directory, once the workspace is installed:

```sh
pnpm dev:local      # hot-reload dev server against a local backend
pnpm build           # type-check + build for production
pnpm lint            # ESLint
```

## Storybook

Storybook renders dashboard components in isolation. Stories live next to their component as
`*.stories.ts`, and the shared setup lives in `.storybook/`.

```sh
pnpm storybook          # dev server on http://localhost:6006
pnpm build-storybook    # static build into storybook-static/
pnpm test               # runs every story as a Vitest browser test
```

### Writing a story

Every existing story uses one of four provider patterns. Copy the one that matches your component:

- Bare, see `ActionButton.stories.ts`. The component needs nothing beyond PrimeVue.
- Router, see `CardComponent.stories.ts`. The component needs `mockRouter`.
- i18n, see `ContainerActionsForm.stories.ts`. The component needs the real i18n instance. For a
  `vee-validate` form prop, build it with the app's own `schemaToForm()` helper instead of mocking
  that shape by hand.
- Full stack, see `ContainersCard.stories.ts`. The component needs Pinia, i18n and the router.
  Seed permission-gated UI through `parameters.pinia.initialState`.

Some behaviour is not obvious from the code:

- A Pinia seed replaces a store's whole state object. It does not merge. Provide every field the
  component reads, not only the ones you want to change. See the doc comment on
  `createSeededPinia` in `.storybook/withPiniaState.ts`.
- Seeding does not intercept store actions. A component that calls a store action on user
  interaction (for example `ContainersCard` fetching a container when an accordion opens) still
  hits the real network and fails. Stub that method with a per-story `vi.fn()`.
- `mockRouter` is one shared instance with real navigation state across all stories. A story that
  navigates should navigate back when it is done.
- `.storybook/registerPrimeVue.ts` has to be kept in sync with `src/main.ts` by hand. When
  `main.ts` registers a new global PrimeVue component, add it there too.

### Documenting a component

`@storybook/addon-docs` is installed and `.storybook/main.ts` sets `docgen: 'vue-component-meta'`,
so every component gets a generated props and events table (types, defaults, live controls). Two
things are written by hand per component. `ActionButton.stories.ts` is a worked example.

- Add `tags: ['autodocs']` to the story's `meta`. Without it there is no Docs tab.
- Add a one-paragraph `parameters.docs.description.component` that says what the component is for
  and when to use it. Give each prop and event a short `description` in `argTypes` that says what
  it means. The generated table already shows the type.

Vue's `argTypes` typing expects `onClick` rather than `click` for an emitted event. Key the entry
by the plain emit name anyway and cast the object to `Meta<typeof Component>['argTypes']`.
Otherwise the docs table lists the event twice.

### Components driven by a parent lifecycle

Some components, like `ActionButton`, do not own their `submitting` or `result` state. A parent
sets it in response to an emitted event. Do not fake that with a play function or a fixed set of
props. Give the default story a small stateful wrapper instead: local `ref`s and a `@click`
handler that does what a real parent does. Clicking the story in the canvas then shows the real
lifecycle. See the `Default` story in `ActionButton.stories.ts`.
