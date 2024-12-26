import { createRouter, createWebHistory } from "vue-router";
import WeatherPage from "../components/WeatherPage.vue";
import store from "../Auth/store";
import Profile from "../Auth/Profile.vue";
import Login from "../Auth/Login.vue";

import Users from "../Auth/Admin/Users.vue";

const routes = [
  { path: "/", component: WeatherPage },
  { path: "/login", component: Login },
  {
    path: "/profile",
    component: Profile,
    meta: { allowedRoles: ["user", "uploader", "admin"] },
  },
  { path: "/admin/users", component: Users, meta: { allowedRoles: ["admin"] } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  //const token = store.getters.getToken;
  const userRole = store.getters.getUserRole;
  if (to.meta.allowedRoles) {
    if (!to.meta.allowedRoles.includes(userRole)) {
      next("/login");
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
