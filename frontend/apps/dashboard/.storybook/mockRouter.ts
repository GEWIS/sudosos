import { createMemoryHistory, createRouter } from 'vue-router';

export const mockRouter = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div />' } },
    { path: '/mock/:id?', name: 'mock-route', component: { template: '<div />' } },
  ],
});
