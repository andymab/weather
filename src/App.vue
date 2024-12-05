<template>
    <v-app >
      <v-main class="background"  >
        <v-container fluid class="mx-auto pa-0" >
          <router-view />
        </v-container>
      </v-main>
    </v-app>
  </template>
  
  <script>
 
  export default {
    name: 'App',

    data() {
      return {
 

      }
    },
    async mounted() {

    },
  
    methods: {

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
  