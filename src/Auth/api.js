import axios from "axios";
import { useAuthStore } from '@/stores/auth'; // Pinia store
import { generateHMAC } from "@/Auth/hmac.js"; // шифрование для login и для регистрации

// Получаем базовый URL из .env
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const apiKey = import.meta.env.VITE_APP_SECRET_KEY;

const apiClient = axios.create({
  baseURL: baseURL + "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Добавляем интерсептор для запросов
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    const token = authStore.token; // Получаем токен из Pinia store
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Добавляем токен в заголовок
    }
    return config; // Возвращаем изменённый конфиг
  },
  (error) => {
    return Promise.reject(error); // Обработка ошибок
  }
);

// Интерсептор для ответов (обработка 401 ошибки)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore();
      authStore.logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  downloadLocations() {
    return apiClient.get(`/download-locations`);
  },
  
  uploadLocations(locations) {
    return apiClient.post(`/upload-locations`, {
      locations: locations,
    });
  },
  
  //// SavedRoute
  downloadSavedRoute(){
    return apiClient.get(`/download-routes`);
  },
  
  createDirectory(dir){
    return apiClient.post(`/create-directory`, dir);
  },
  
  deleteDirectory(dir){
    return apiClient.delete(`/delete-directory`, { data: dir });
  },
  
  uploadRoute(data) {
    return apiClient.post(`/upload-route`, data);
  },
  
  downloadFileRoute(url) {
    return apiClient.post(`/download-file-route`, { url });
  },
  
  deleteFileRoute(url) {
    return apiClient.delete(`/delete-file-route`, { params: { url } });
  },
  //// \SavedRoute

  ///системные по пользователю
  getBaseUrl() {
    return baseURL;
  },
  
  async registration(credentials) {
    try {
      const { hash, timestamp } = await generateHMAC(apiKey, credentials);

      return apiClient.post(`/registration`, credentials, {
        headers: {
          "X-HMAC-TOKEN": hash,
          "X-TIMESTAMP": timestamp,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  
  async getToken(credentials) {
    try {
      const { hash, timestamp } = await generateHMAC(apiKey, credentials);

      return apiClient.post(`/gettoken`, credentials, {
        headers: {
          "X-HMAC-TOKEN": hash,
          "X-TIMESTAMP": timestamp,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  
  getUser(id) {
    return apiClient.get(`/users/${id}`);
  },
  
  getRoles() {
    return apiClient.get(`/roles`);
  },
  
  getUsers() {
    return apiClient.get(`/users`);
  },
  
  updateUser(updatedData) {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    
    if (updatedData.has("id")) {
      const id = updatedData.get("id");
      return apiClient.post(`/user/${id}`, updatedData, config);
    } else {
      //новый
      return apiClient.post(`/user`, updatedData, config);
    }
  },
  
  updateUserProfile(updatedData) {
    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };
    return apiClient.post(`/profile`, updatedData, config);
  },

  getReminders() {
    //получение напоминалок
    return apiClient.get(`/reminders`);
  },
  
  addReminder(data) {
    //добавление напоминалок
    return apiClient.post(`/reminders`, data);
  },
  
  updateReminder(id, upData){
    //изменение напоминалки
    return apiClient.put(`/reminders/${id}`, upData);
  },
  
  deleteReminder(id){
    return apiClient.delete(`/reminders/${id}`);
  },
};