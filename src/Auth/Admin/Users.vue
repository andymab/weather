vue
<template>
  <v-container>
    <v-data-table :headers="headers" :items="users" :items-per-page="20" :search="search" class="elevation-1">
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Пользователи</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-text-field v-model="search" label="Поиск" class="mx-4"></v-text-field>
          <v-btn color="primary" @click="openCreateDialog">
            <v-icon start>mdi-plus</v-icon>
            Добавить пользователя
          </v-btn>
        </v-toolbar>
      </template>


      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template v-slot:item.paid="{ item }">
        <v-icon :color="item.paid ? 'green' : 'red'">
          {{ item.paid ? 'mdi-check' : 'mdi-close' }}
        </v-icon>
      </template>

      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template v-slot:item.payment_time="{ item }">
        {{ formatPaymentTime(item.payment_time) }}
      </template>

      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template v-slot:item.actions="{ item }">
        <v-btn @click="editUser(item)">Редактировать</v-btn>
      </template>
    </v-data-table>

    <UserEditDialog v-model="editDialog" :user="selectedUser" :roles="roles" @refresh="fetchUsers"
      @close="dialog = false" />

    <UserCreateDialog v-model="createDialog" :roles="roles" @refresh="fetchUsers" @close="createDialog = false" />
  </v-container>
</template>

<script>
import api from "../api"
import UserEditDialog from './resource/UserEditDialog.vue';
import UserCreateDialog from './resource/UserCreateDialog.vue'; 
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';


export default {
  components: { UserEditDialog, UserCreateDialog },
  data() {
    return {
      users: [],
      roles: [],
      loading: false,
      editDialog: false,
      selectedUser: null,
      createDialog: false,
      search: '',
      headers: [
        { text: 'Имя', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Роль', value: 'role' },
        { text: 'Оплачено', value: 'paid' },
        { text: 'Дата оплаты', value: 'payment_time' },
        { text: 'Действия', value: 'actions', sortable: false },
      ],
    };
  },
  async created() {
    try {
      const response = await api.getRoles();
      this.roles = response.data;
    } catch (error) {
      console.error("Ошибка при загрузке roles:", error);
    }
  },
  methods: {
    formatPaymentTime(dateString) {
      if (dateString) {
        const date = parseISO(dateString); // Преобразуем строку в объект Date
        return format(date, 'dd.MM.yyyy', { locale: ru }); // Форматируем дату     
      }
      return null;
    },
    async fetchUsers() {
      this.loading = true;
      try {
        const response = await api.getUsers();
        this.users = response.data;
        //this.lessons.splice(0, this.lessons.length, ...response.data);
      } catch (error) {
        console.error("Ошибка при загрузке users:", error);
      } finally {
        this.loading = false; // Сбрасываем состояние загрузки
      }

    },
    editUser(user) {
      this.selectedUser = user;
      this.editDialog  = true;
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>