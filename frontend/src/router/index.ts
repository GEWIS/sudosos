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
import { isAuthenticated } from "@sudosos/sudosos-frontend-common";

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
        }
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
          component: POSOverviewView
        },
        {
          path: '/point-of-sale/info/:id',
          name: 'pointOfSaleInfo',
          component: POSInfoView,
          props: true
        },
        {
          path: '/point-of-sale/request',
          name: 'pointOfSaleCreate',
          component: POSCreateView
        },
        {
          path: '/point-of-sale/edit/:id',
          name: 'pointOfSaleEdit',
          component: POSEditView,
          props: true
        },
        {
          path: '/user-overview',
          component: UserOverView,
          name: 'userOverview'
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
        }
        // Add other routes for authenticated users here
      ]
    }
  ]
});

router.beforeEach((to, from, next) => {
  const isAuth = isAuthenticated();

  if (to.meta?.requiresAuth && !isAuth) {
    // If the route requires authentication and the user is not authenticated, redirect to login
    next({ name: 'login' });
  } else if (!to.meta?.requiresAuth && isAuth) {
    // If the route doesn't require authentication and the user is authenticated, redirect to home
    next({ name: 'home' });
  } else {
    // Allow navigation to proceed
    next();
  }
});

export default router;
