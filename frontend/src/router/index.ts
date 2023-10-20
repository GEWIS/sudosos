import { createRouter, createWebHistory } from 'vue-router';
import POSOverviewView from '@/views/PointOfSale/POSOverviewView.vue';
import POSInfoView from '@/views/PointOfSale/POSInfoView.vue';
import POSCreateView from '@/views/PointOfSale/POSCreateView.vue';
import POSEditView from '@/views/PointOfSale/POSEditView.vue';
import PublicLayout from "@/layout/PublicLayout.vue";
import DashboardLayout from "@/layout/DashboardLayout.vue";
import HomeView from '../views/HomeView.vue';
import LoginView from "@/views/LoginView.vue";
import BalanceView from "@/views/BalanceView.vue";
import UserOverView from '../views/UserOverView.vue';
import SingleUserView from "@/views/SingleUserView.vue";
import ProductsContainersView from "@/views/ProductsContainersView.vue";
import { isAuthenticated, useAuthStore, useUserStore } from "@sudosos/sudosos-frontend-common";
import PasswordResetView from "@/views/PasswordResetView.vue";
import { UserRole } from '@/utils/rbacUtils';
import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    // must be declared by every route
    requiresAuth: boolean

    // Admin
    isAdmin?: boolean,

    // Seller
    isSeller?: boolean,

    // BAC
    isBAC?: boolean,
  }
}



const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '',
      component: PublicLayout,
      children: [
        {
          path: '',
          component: LoginView,
          name: 'login'
        },
        {
          path: '/passwordreset',
          component: PasswordResetView,
          name: 'passwordreset'
        },
      ]
    },
    {
      path: '',
      component: DashboardLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '/',
          component: HomeView,
          name: 'home'
        },
        {
          path: '/balance',
          component: BalanceView,
          name: 'balance'
        },
        {
          path: '/point-of-sale/overview',
          name: 'pointOfSale',
          component: POSOverviewView,
          meta: { requiresAuth: true, isSeller: true }
        },
        {
          path: '/point-of-sale/info/:id',
          name: 'pointOfSaleInfo',
          component: POSInfoView,
          props: true,
          meta: { requiresAuth: true, isSeller: true }
        },
        {
          path: '/point-of-sale/request',
          name: 'pointOfSaleCreate',
          component: POSCreateView,
          meta: { requiresAuth: true, isSeller: true }
        },
        {
          path: '/point-of-sale/edit/:id',
          name: 'pointOfSaleEdit',
          component: POSEditView,
          props: true,
          meta: { requiresAuth: true, isSeller: true }
        },
        {
          path: '/user-overview',
          component: UserOverView,
          name: 'userOverview',
          meta: { requiresAuth: true, isBAC: true }
        },
        {
          path: '/user/:userId',
          component: SingleUserView,
          name: 'user',
          props: true,
        },
        {
          path: '/manage-products',
          component: ProductsContainersView,
          name: 'products-containers-overview',
          meta: { requiresAuth: true, isBAC: true }
        }
        // Add other routes for authenticated users here
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  const isAdmin = () => {
    return authStore.roles.includes(UserRole.BOARD);
  };

  const isBAC = () => {
    return authStore.roles.includes(UserRole.BAC);
  };

  const isSeller = () => {
    return authStore.roles.includes(UserRole.SELLER);
};

  const isAuth = isAuthenticated();

  if (to.meta?.requiresAuth && !isAuth) {
    // If the route requires authentication and the user is not authenticated, redirect to login
    next({ name: 'login' });
  } else if (!to.meta?.requiresAuth && isAuth) {
    // If the route doesn't require authentication and the user is authenticated, redirect to home
    next({ name: 'home' });
  } else {
    if(to.meta?.isAdmin && !isAdmin()) next({ name: 'home' }); 
    
    if(to.meta?.isSeller && !isSeller()) next({ name: 'home' });

    if(to.meta?.isBAC && !isBAC()) next({ name: 'home' });
  
    next();
  }
});

export default router;
