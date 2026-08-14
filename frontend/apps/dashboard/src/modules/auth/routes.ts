import type { RouteRecordRaw } from 'vue-router';
import AuthLoginView from '@/modules/auth/views/AuthLoginView.vue';
import AuthLocalView from '@/modules/auth/views/AuthLocalView.vue';
import AuthResetView from '@/modules/auth/views/AuthResetView.vue';
import AuthLayout from '@/modules/auth/layouts/AuthLayout.vue';
import AuthTermsOfServiceView from '@/modules/auth/views/AuthTermsOfServiceView.vue';
import PublicLayout from '@/layout/PublicLayout.vue';
import AuthQrConfirmView from '@/modules/auth/views/AuthQrConfirmView.vue';

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
              meta: {
                requiresAuth: false,
                title: 'common.titles.login',
              },
            },
            {
              path: '/local',
              component: AuthLocalView,
              name: 'local',
              alias: ['/local'],
              meta: {
                requiresAuth: false,
                title: 'common.titles.localLogin',
              },
            },
            {
              path: '/passwordreset',
              component: AuthResetView,
              name: 'passwordreset',
              meta: {
                requiresAuth: false,
                title: 'common.titles.passwordReset',
              },
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
    {
      path: '',
      component: PublicLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: AuthLayout,
          children: [
            {
              path: '/auth/qr/confirm',
              component: AuthQrConfirmView,
              name: 'qr-confirm',
              meta: {
                requiresAuth: true,
                title: 'common.titles.qrConfirm',
              },
            },
          ],
        },
      ],
    },
  ];
}
