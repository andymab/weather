import { createApp } from 'vue';
import App from './App.vue';
import router from './router'; // Создайте router.js для маршрутов
import { createVuetify } from "vuetify";
import store from "./Auth/store";


import "vuetify/styles";

import "@mdi/font/css/materialdesignicons.css";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import DateFnsAdapter from "@date-io/date-fns";
import { ru } from "date-fns/locale";


const vuetify = createVuetify({
    components,
    directives,
    date: {
      adapter: DateFnsAdapter,
      locale: {
        ru: ru,
        en: ru,
      },
    },
  });
  
  import "vuetify/dist/vuetify.min.css";

const app = createApp(App);
app.use(store);
app.use(router);
app.use(vuetify);
app.mount('#app');
