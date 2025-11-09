
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import NotifyPlugin from '@/plugins/notify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import App from './App.vue'
import router from './router'

import DateFnsAdapter from "@date-io/date-fns";
import { ru } from "date-fns/locale";



const pinia = createPinia()

const vuetify = createVuetify({
  components, directives, date: {
    adapter: DateFnsAdapter,
    locale: {
      ru: ru,
      en: ru,
    },
  },
  defaults: { VBtn: { rounded: 'xl' } }
})


//import "vuetify/dist/vuetify.min.css";

const app = createApp(App);
app.use(NotifyPlugin, { vuetify })
app.use(pinia)
app.use(vuetify);
app.use(router);
app.mount('#app');
