import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Cookies from 'js-cookie';

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref(null);
  const user = ref(null);
  
  // Getters (computed)
  const isUserAuth = computed(() => !!token.value && !!user.value);
  const isUserAdmin = computed(() => user.value?.role === 'admin');
  const getUserName = computed(() => user.value?.name || null);
  const getUserEmail = computed(() => user.value?.email || null);
  const getUserRole = computed(() => user.value?.role || null);
  const getUserAvatar = computed(() => {
    if (!user.value?.media_content) {
      return "https://cdn.vuetifyjs.com/images/john.png";
    }
    
    // Используем .env переменные
    const baseURL = import.meta.env.VITE_API_URL || '';
    return `${baseURL}/public/${user.value.media_content}`;
  });

  // Actions
  const setToken = (newToken) => {
    if (newToken) {
      token.value = newToken;
      Cookies.set("token", newToken);
    } else {
      token.value = null;
      Cookies.remove("token");
    }
  };

  const setUser = (newUser) => {
    if (newUser) {
      user.value = newUser;
      Cookies.set("user", JSON.stringify(newUser));
    } else {
      user.value = null;
      Cookies.remove("user");
    }
  };

  const login = (loginToken, userData) => {
    setToken(loginToken);
    setUser(userData);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Initialize from cookies
  const initializeFromCookies = () => {
    const savedToken = Cookies.get("token");
    const savedUser = Cookies.get("user");
    
    if (savedToken) {
      token.value = savedToken;
    }
    
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        Cookies.remove("user");
      }
    }
  };

  // Call initialization
  initializeFromCookies();

  return {
    // State
    token,
    user,
    
    // Getters
    isUserAuth,
    isUserAdmin,
    getUserName,
    getUserEmail,
    getUserRole,
    getUserAvatar,
    
    // Actions
    setToken,
    setUser,
    login,
    logout,
    initializeFromCookies
  };
});