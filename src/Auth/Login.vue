<template>
    <v-dialog v-model="loginDialog" persistent max-width="400px">
        <v-card>
            <v-card-title>Пройдите авторизацию</v-card-title>
            <v-card-text>
                <v-form validate-on="submit lazy" @submit.prevent="login">
                    <v-text-field 
                        color="primary" 
                        variant="underlined" 
                        v-model="email" 
                        :rules="emailRules" 
                        type="email"
                        label="Email" 
                        required
                    ></v-text-field>
                    <v-text-field 
                        color="primary" 
                        variant="underlined" 
                        v-model="password" 
                        type="password" 
                        label="Пароль"
                        required
                    ></v-text-field>
                    <v-checkbox 
                        v-model="rememberMe" 
                        density="compact" 
                        label="Запомнить меня"
                    ></v-checkbox>
                    <!-- <v-btn variant="text" color="primary" @click="goToRegistration" text="Зарегистрироваться"
                        block></v-btn> -->
                    <v-btn 
                        :loading="loading" 
                        class="mt-4" 
                        text="Войти" 
                        type="submit" 
                        block
                    ></v-btn>
                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import api from "./api"
import { useAuthStore } from '@/stores/auth';

export default {
    name: 'Login',
    data() {
        return {
            rememberMe: false,
            loginDialog: true,
            emailRules: [
                value => {
                    var re = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
                    if (!re.test(String(value).toLowerCase())) {
                        return 'Email не корректен';
                    }
                    return true;
                },
            ],
            email: '',
            password: '',
            loading: false,
        };
    },
    mounted() {
        // Проверка, есть ли сохраненные данные в localStorage
        const savedEmail = localStorage.getItem('email');
        const savedPassword = localStorage.getItem('password');
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

        if (savedRememberMe) {
            this.email = savedEmail;
            this.password = savedPassword;
            this.rememberMe = true;
        }
    },
    methods: {
        goToRegistration() {
            this.$router.push('/registration');
        },
        async login() {
            this.loading = true;
            
            try {
                const response = await api.getToken({ 
                    email: this.email, 
                    password: this.password 
                });
                const data = response.data;

                if (data.status === 'success') {
                    const token = data.api_token;

                    // Используем Pinia store вместо Vuex
                    const authStore = useAuthStore();
                    authStore.login(token, data.user);

                    if (this.rememberMe) {
                        localStorage.setItem('email', this.email);
                        localStorage.setItem('password', this.password);
                        localStorage.setItem('rememberMe', 'true');
                    } else {
                        localStorage.removeItem('email');
                        localStorage.removeItem('password');
                        localStorage.removeItem('rememberMe');
                    }

                    this.$notify.success('Вход выполнен успешно!');
                    this.$router.push('/');
                    
                } else {
                    console.error('Ошибка при входе:', data.message);
                    this.$notify.error(data.message || 'Ошибка при входе');
                    
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
            } finally {
                this.loading = false;
            }
        }
    }
};
</script>