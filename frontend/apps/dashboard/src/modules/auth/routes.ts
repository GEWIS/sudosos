import type { RouteRecordRaw } from 'vue-router';
import AuthLoginView from '@/modules/auth/views/AuthLoginView.vue';
import AuthLocalView from '@/modules/auth/views/AuthLocalView.vue';
import AuthResetView from '@/modules/auth/views/AuthResetView.vue';
import AuthLayout from '@/modules/auth/layouts/AuthLayout.vue';
import AuthTermsOfServiceView from '@/modules/auth/views/AuthTermsOfServiceView.vue';
import PublicLayout from '@/layout/PublicLayout.vue';

export function authRoutes(): RouteRecordRaw[] {
  return [
    {
      path: '',
      component: PublicLayout,
      children: [
        {
          path: '',
          component: AuthLayout,
          children: [
            {
              path: '',
              component: AuthLoginView,
              name: 'login',
              alias: ['/login'],
            },
            {
              path: '/local',
              component: AuthLocalView,
              name: 'local',
              alias: ['/local'],
            },
            {
              path: '/passwordreset',
              component: AuthResetView,
              name: 'passwordreset',
            },
          ],
        },
      ],
    },
    {
      path: '',
      component: PublicLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/',
          component: AuthTermsOfServiceView,
          name: 'tos',
        },
      ],
    },
  ];
}
