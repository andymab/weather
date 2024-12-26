<template>
  <v-container fluid>
    <v-row>
      <!-- Первая колонка с формой -->
      <v-col cols="12" md="3">
        <v-card class="pa-4 d-flex align-center justify-center flex-column">
          <v-card-text class="text-center">
            <v-form ref="form" v-model="valid">
              <div class="position-relative mb-4">
                <div class="image-avatar">
                  <v-avatar size="230" class="mb-4" :color="imageUrl ? 'default' : 'primary'">
                    <v-img v-if="imageUrl" :src="imageUrl" alt="Avatar" cover></v-img>
                    <span v-else class="text-h3">{{ initialsUser }}</span>
                  </v-avatar>
                </div>
                <v-btn icon color="primary" density="compact" @click="openImageDialog"
                  class="position-absolute top-0 right-0">
                  <v-icon size="x-small">mdi-pencil</v-icon>
                </v-btn>
              </div>
              <v-text-field v-model="form.name" label="Имя" variant="outlined"></v-text-field>
              <v-text-field v-model="form.email" label="Электронная почта" variant="outlined"></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="updateProfile">Сохранить изменения</v-btn>
          </v-card-actions>
          <image-picker-dialog v-model="showDialog" :model-picker="`avatar`"
            @selected="updateAvatar"></image-picker-dialog>
          <AlertChackbar ref="snackbar" />
        </v-card>
      </v-col>
      <v-col cols="12" md="9">

      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import AlertChackbar from "./util/AlertChackbar.vue"
import ImagePickerDialog from './util/ImagePickerDialog.vue';


import api from "./api"


export default {
  name: 'Profile',
  components: {
    AlertChackbar, ImagePickerDialog,
  },
  created() {
    const user = this.$store.getters.getUser;
    this.form.name = user.name;
    this.form.email = user.email;
    this.form.media_content = user.media_content;
    this.imageUrl = this.form.media_content ? api.getBaseUrl() + '/public/' + this.form.media_content : ''; // по хорошему формируем пустой img-src, но пока так
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        media_content: '',

      },
      products: [],
      imageUrl: null,
      showDialog: false,
      valid: false,
      errors: {},
      rules: {
        required: (value) => !!value || 'Обязательное поле',
        email: (value) => /.+@.+\..+/.test(value) || 'Некорректный email',
        password: (value) => {
          if (!value) {
            return true;
          }
          return (
            (value || '').length >= 6 || 'Пароль должен содержать не менее 6 символов'
          );
        },
      },

    };
  },
  computed: {
    initialsUser() {
      const words = this.form.name.split(' '); // Разделяем строку на слова
      const initials = words.map(word => word.charAt(0).toUpperCase()).join(''); // Получаем первые буквы и объединяем их
      return initials; // Возвращаем инициалы
    }
  },
  methods: {
    triggerSnackbar(message, color) {
      this.$refs.snackbar.showSnackbar(message, color); //// info, primary, secondary, success, warning, error
    },
    async updateProfile() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        const formData = new FormData();


        formData.append('file', this.file);
        formData.append('name', this.form.name);
        formData.append('email', this.form.email);

        // Если введен новый пароль, добавляем его
        if (this.password) {
          formData.append('password', this.password);
        }

        try {
          const response = await api.updateUserProfile(formData);
          const data = response.data;
          if (data.status === 'success') {
            this.$store.dispatch('user', data.user);

          }
          this.triggerSnackbar(data.message, 'info');
        } catch (error) {
          this.triggerSnackbar(error, 'warnuing');
          this.errors = error.response.data.errors;
        } finally {
          this.loading = false;
        }
      }

    },
    updateAvatar({ imageUrl, file }) {
      this.showDialog = false;
      this.imageUrl = imageUrl; // Обновляем URL аватара с помощью выбранного изображения
      this.file = file;
    },
    openImageDialog() {
      this.showDialog = true;
    }
  }

};
</script>

<style scoped>
.image-avatar {
  width: 230px;
  height: 230px;
}
</style>