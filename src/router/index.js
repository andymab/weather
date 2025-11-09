import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from '@/stores/auth';

import WeatherPage from "../components/WeatherPage.vue";
import Profile from "../Auth/Profile.vue";
import Login from "../Auth/Login.vue";
import Users from "../Auth/Admin/Users.vue";
import Reminders from "../Auth/Admin/Reminders.vue";

const routes = [
  { path: "/", component: WeatherPage },
  { path: "/login", component: Login },
  {
    path: "/profile",
    component: Profile,
    meta: { requiresAuth: true, allowedRoles: ["user", "uploader", "admin"] },
  },
  { 
    path: "/admin/users", 
    component: Users, 
    meta: { requiresAuth: true, allowedRoles: ["admin"] } 
  },
  { 
    path: "/admin/reminders", 
    component: Reminders, 
    meta: { requiresAuth: true, allowedRoles: ["admin"] } 
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  // Получаем store внутри guard'а
  const authStore = useAuthStore();
  const userRole = authStore.getUserRole;
  const isAuthenticated = authStore.isUserAuth;

  // Проверка аутентификации
  if (to.meta.requiresAuth && !isAuthenticated) {
    next("/login");
    return;
  }

  // Проверка ролей
  if (to.meta.allowedRoles) {
    if (!userRole || !to.meta.allowedRoles.includes(userRole)) {
      // Если пользователь не авторизован - на логин, иначе на главную
      next(isAuthenticated ? "/" : "/login");
      return;
    }
  }

  // Если пользователь авторизован и пытается зайти на логин - редирект на главную
  if (to.path === '/login' && isAuthenticated) {
    next("/");
    return;
  }

  next();
});

export default router;