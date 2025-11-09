<template>
  <v-app>

    <v-app-bar app v-if="$route.path !== '/login' && $route.path !== '/registration'" :elevation="0" density="compact"
      scroll-behavior="hide" class="pa-0">

      <v-btn
        class="ma-2"
        color="light-blue-darken-3"
        icon="mdi-home-outline"
        variant="text"
        to="/"
        v-tooltip.bottom="'на главную'"
      ></v-btn>


      <v-spacer></v-spacer>

      <div v-if="isUserAuth">
        <v-btn icon="mdi-dots-vertical" id="topmenu-activator"></v-btn>
        <v-menu activator="#topmenu-activator">
          <MenuIsUserAuth />
        </v-menu>
      </div>
      <v-btn v-else icon="mdi-login" @click="login" size="small" color="light-blue-darken-3"></v-btn>
    </v-app-bar>


    <v-main class="background">
      <v-container fluid class="mx-auto pa-0">
        <router-view />
        <GlobalNotifier />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import permission from './Auth/permissions.mjs';
import MenuIsUserAuth from './Auth/MenuIsUserAuth.vue';
import GlobalNotifier from '@/components/GlobalNotifier.vue'
export default {
  name: 'App',
  components: { MenuIsUserAuth, GlobalNotifier },
  mixins: [permission],

  methods: {
    login() { this.$router.push('/login') },
  },
}
</script>
<style>
html {
  overflow-y: auto !important;
  /* Изменяем на auto */
}

.background {
  background-color: rgb(226, 226, 226);
}
</style>