<template>
    <v-snackbar v-model="show" :timeout="3000" :color="color">
      {{ message }}
      <template #action="{ attrs }">
        <v-btn text v-bind="attrs" @click="show = false">Закрыть</v-btn>
      </template>
    </v-snackbar>
  </template>
  
  <script>
  export default {
    name: 'Notification',
    data() {
      return {
        show: false,
        message: '',
        color: 'success',
      };
    },
    methods: {
      notify(msg, color = 'success') {
        this.message = msg;
        this.color = color;
        this.show = true;
      },
    },
  };
  </script>
  