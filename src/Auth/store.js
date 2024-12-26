import { createStore } from "vuex";
import config from "./config/env.js";
import Cookies from "js-cookie";


export default createStore({
  state: {
    token: null,
    user: null,
    isUserAuth: false,
    isUserAdmin: false,
  },
  mutations: {
    setToken(state, token) {
      if (token) {
        state.token = token;
        Cookies.set("token", token);
      } else {
        Cookies.remove("token");
        state.token = null;
      }
    },
    setUser(state, user) {
      if (user) {
        state.user = user;
        Cookies.set("user", JSON.stringify(user));
        state.isUserAuth=true;
        state.isUserAdmin = user.role === 'admin' || false;

      } else {
        Cookies.remove("user");
        state.user = null;
        state.isUserAuth=false;
        state.isUserAdmin = false;
      }
    },
  },
  actions: {
    login({ commit }, token) {
      commit("setToken", token);
    },
    logout({ commit }) {
      commit("setToken", null);
      commit("setUser", null);
    },    
    user({ commit }, user) {
      commit("setUser", user);
    },
  },
  getters: {
    getToken: (state) => {
      if (!state.token) {
        const token = Cookies.get("token");
        if (token) {
          state.token = token;
        }
      }
      return state.token;
    },
    getUser: (state) => {
      if (!state.user) {
        const user = Cookies.get("user");
        if (user) {
          state.user = JSON.parse(user);
          state.isUserAuth=true;
          state.isUserAdmin = state.user.role === 'admin' || false;
        }
      }
      return state.user;
    },
    isUserAuth: (state) => {
      return state.isUserAuth;
    },
    isUserAdmin: (state) => {
      return state.isUserAdmin;
    },
    getUserName: (state) => {
      return state.user ? state.user.name : null; // Получаем имя пользователя
    },
    getUserEmail: (state) => {
      return state.user ? state.user.email : null; // Получаем имя пользователя
    },
    getUserRole: (state) => {
      return state.user ? state.user.role : null; // Получаем роль пользователя
    },
    getUserAvatar: (state) => {
      return state.user
        ? config.baseURL + "/public/" + state.user.media_content
        : "https://cdn.vuetifyjs.com/images/john.png"; // Получаем avatar
    },
  },
});
