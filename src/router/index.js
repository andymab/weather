import { createRouter, createWebHistory } from "vue-router";
import WeatherForm from "../components/WeatherForm.vue";


const routes = [
  { path: "/", component: WeatherForm },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// router.beforeEach((to, from, next) => {
//   const userRole = store.getters.getUserRole;
//   if (to.meta.allowedRoles) {
//     if (!to.meta.allowedRoles.includes(userRole)) {
//       next("/login");
//     } else {
//       next();
//     }
//   } else {
//     next();
//   }
// });

export default router;
