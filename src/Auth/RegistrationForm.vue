<template>
  <v-container>
    <v-dialog v-model="RegistrationDialog" persistent full-width>
      <v-row>
        <v-col cols="12" sm="8" md="6" lg="3" class="mx-auto">
          <v-card>
            <v-card-title>Пройдите авторизацию</v-card-title>
            <v-card-text>

              <div v-if="!isCaptchaVerified">
                <div ref="recaptcha" class="g-recaptcha mb-2" :data-sitekey="siteKey" size="compact"></div>
              </div>
              <v-form v-if="isCaptchaVerified" ref="form" v-model="valid" lazy-validation>

                <v-text-field 
                  v-model="username" 
                  :rules="[rules.required]" 
                  label="Имя пользователя"
                  required
                ></v-text-field>

                <v-text-field 
                  v-model="email" 
                  :rules="[rules.required, rules.email]" 
                  label="Электронная почта"
                  required
                ></v-text-field>

                <v-text-field 
                  v-model="password" 
                  :rules="[rules.required, rules.min]" 
                  label="Пароль" 
                  type="password"
                  required
                ></v-text-field>

                <v-text-field 
                  v-model="confirmPassword" 
                  :rules="[rules.required, rules.confirmPassword]"
                  label="Подтверждение пароля" 
                  type="password" 
                  required
                ></v-text-field>

                <v-btn @click="submit">Зарегистрироваться</v-btn>
                <v-btn @click="cancel" color="secondary" class="ml-4">Отмена</v-btn>
              </v-form>

            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-dialog>
  </v-container>
</template>

<script>
import api from "../../api";
import { useAuthStore } from '@/stores/auth';

export default {
  name: 'RegistrationForm',
  data() {
    return {
      isCaptchaVerified: false,
      RegistrationDialog: true,
      valid: false,
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY, // Из .env
      rules: {
        required: value => !!value || 'Это поле обязательно',
        email: value => /.+@.+\..+/.test(value) || 'Введите корректный email',
        min: value => (value && value.length >= 6) || 'Пароль должен содержать минимум 6 символов',
        confirmPassword: value => value === this.password || 'Пароли не совпадают',
      },
    };
  },
  computed: {
    recaptchakey() {
      return import.meta.env.VITE_RECAPTCHA_LOCAL_KEY; // Из .env
    },
  },
  mounted() {
    window.onCaptchaVerified = this.onCaptchaVerified;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=vueRecaptchaApiLoaded&render=explicit';

    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    window.vueRecaptchaApiLoaded = () => {
      if (window.grecaptcha && this.$refs.recaptcha) {
        window.grecaptcha.render(this.$refs.recaptcha, {
          sitekey: this.siteKey,
          callback: this.onCaptchaVerified,
        });
      }
    };
  },
  methods: {
    cancel() {
      this.RegistrationDialog = false;
      this.$router.push('/login'); // Перенаправляем на логин при отмене
    },
    
    onCaptchaVerified(response) {
      if (response) {
        this.isCaptchaVerified = true;
        window.grecaptcha.reset(); // Reset the widget
      }
    },
    
    async submit() {
      if (this.$refs.form.validate()) {
        try {
          const response = await api.registration({
            name: this.username,
            email: this.email,
            password: this.password,
            password_confirmation: this.confirmPassword,
          });
          
          const data = response.data;

          if (data.status === 'success') {
            this.$refs.form.reset();
            
            // Используем Pinia store вместо Vuex
            const authStore = useAuthStore();
            const token = data.api_token;
            authStore.login(token, data.user);
            
            this.$notify.success('Регистрация прошла успешно!');
            this.$router.push('/');
            
          } else {
            console.error('Ошибка при регистрации:', data.message);
            this.$notify.error(data.message || 'Ошибка при регистрации');
            
            // Используем Pinia store
            const authStore = useAuthStore();
            authStore.logout();
          }
        } catch (error) {
          console.error('Ошибка сервера:', error);
          this.$notify.error(error.response?.data?.message || 'Ошибка сервера');
          
          // Используем Pinia store
          const authStore = useAuthStore();
          authStore.logout();
        }
      }
    },
  },
};
</script>

<style scoped>
/* Добавьте стили, если необходимо */
</style>