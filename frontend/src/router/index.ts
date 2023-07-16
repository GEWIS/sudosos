import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from "@/views/LoginView.vue";
import PublicLayout from "@/layout/PublicLayout.vue";
import DashboardLayout from "@/layout/DashboardLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      component: PublicLayout,
      children: [
        {
          path: '/login',
          component: LoginView,
          name: 'login',
        },
      ],
    },
    {
      path: '',
      component: DashboardLayout,
      children: [
        {
          path: '/',
          component: HomeView,
          name: 'home',
        },
      ],
    },
]})


router.beforeEach((to, from, next) => {
  const isAuthenticated = true;

  if (isAuthenticated && to.name === 'home'){next();}
  console.log(to, from);
  if (!isAuthenticated && to.name !== 'login'){
    next({name: 'login'});
  } else if (isAuthenticated && to.name !== 'login'){
    console.error(1)
    next({name: 'home'}); // TODO: Actually fix this
  } else {
    console.error(2)
    next();
  }
})

export default router
