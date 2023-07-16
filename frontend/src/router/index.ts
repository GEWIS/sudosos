import { createRouter, createWebHistory } from 'vue-router'
import LoginView from "@/views/LoginView.vue";
import CashierView from "@/views/CashierView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/cashier',
      name: 'cashier',
      component: CashierView,
    },
    {
      path: '/',
      name: 'login',
      component: LoginView,
    },
  ]
})

export default router
