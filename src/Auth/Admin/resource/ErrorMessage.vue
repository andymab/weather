<template>
    <v-alert v-if="message" type="error" dismissible class="mt-4">
      {{ message }}
    </v-alert>
  </template>
  
  <script>
  export default {
    props: {
      message: {
        type: String,
        default: ''
      }
    }
  }
  </script>
  
  <style scoped>
  /* Добавьте стили, если необходимо */
  </style>