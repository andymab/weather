import axios from "axios";
import config from "./config/env.js";
import store from "./store.js"; // хранилище
import { generateHMAC } from "./hmac.js"; //шифрование для login и для регистрации

const apiClient = axios.create({
  baseURL: config.baseURL + "/api",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${config.token}`,
  },
});

// Добавляем интерсептор для запросов
apiClient.interceptors.request.use(
  (config) => {
    const token = store.getters.getToken; // Получаем токен из хранилища
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Добавляем токен в заголовок
    }
    return config; // Возвращаем изменённый конфиг
  },
  (error) => {
    return Promise.reject(error); // Обработка ошибок
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

///системные по пользователю
  getBaseUrl() {
    return config.baseURL;
  },
  registration(credentials) {
    const { hash, timestamp } = generateHMAC(config.apiKey, credentials);

    try {
      return apiClient.post(`/registration`, credentials, {
        headers: {
          "X-HMAC-TOKEN": hash,
          "X-TIMESTAMP": timestamp,
        },
      });
    } catch (error) {
      console.error("Login error:", error.response);
    }
  },
  getToken(credentials) {
    const { hash, timestamp } = generateHMAC(config.apiKey, credentials);

    try {
      return apiClient.post(`/gettoken`, credentials, {
        headers: {
          "X-HMAC-TOKEN": hash,
          "X-TIMESTAMP": timestamp,
        },
      });
    } catch (error) {
      console.error("Login error:", error.response);
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

};
