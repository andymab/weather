// src/Auth/permissions.mjs
import { useAuthStore } from '@/stores/auth';

export default {
  computed: {
    // Получаем весь store для обратной совместимости
    Auth() {
      const authStore = useAuthStore();
      return authStore.user;
    },
    userName() {
      const authStore = useAuthStore();
      return authStore.getUserName;
    },
    userRole() {
      const authStore = useAuthStore();
      return authStore.getUserRole;
    },
    userPaid() {
      const authStore = useAuthStore();
      return authStore.user?.paid || false;
    },
    userEmail() {
      const authStore = useAuthStore();
      return authStore.getUserEmail;
    },
    isUserAllowedToUpload() {
      const authStore = useAuthStore();
      return authStore.userRole === 'uploader' || authStore.userRole === 'admin';
    },
    isAdmin() {
      const authStore = useAuthStore();
      return authStore.isUserAdmin;
    },
    isUserAuth() {
      const authStore = useAuthStore();
      return authStore.isUserAuth;
    }
  }
};