<template>
    <v-dialog v-model="loginDialog" persistent max-width="400px">
        <v-card>
            <v-card-title>Пройдите авторизацию</v-card-title>
            <v-card-text>
                <v-form validate-on="submit lazy" @submit.prevent="login">
                    <v-text-field color="primary" variant="underlined" v-model="email" :rules="emailRules" type="email"
                        label="Email" required></v-text-field>
                    <v-text-field color="primary" variant="underlined" v-model="password" type="password" label="Пароль"
                        required></v-text-field>
                    <v-checkbox v-model="rememberMe" density="compact" label="Запомнить меня"></v-checkbox>
                    <v-btn variant="text" color="primary" @click="goToRegistration" text="Зарегистрироваться"
                        block></v-btn>
                    <v-btn :loading="loading" class="mt-4" text="Войти" type="submit" block></v-btn>


                </v-form>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
import api from "./api"

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
                        return 'Email не корректен'
                    }
                    return true
                },
            ],
            email: '',
            password: '',
            loading: false,
        };
    },
    methods: {
        mounted() {
            // Проверка, есть ли сохраненные данные в localStorage
            const savedEmail = localStorage.getItem('email');
            const savedPassword = localStorage.getItem('password');
            const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

            if (savedRememberMe) {
                this.user.email = savedEmail;
                this.user.password = savedPassword;
                this.rememberMe = true;
            }
        },
        goToRegistration() {
            this.$router.push('/registration');
        },
        async login() {
            try {
                const response = await api.getToken({ email: this.email, password: this.password });
                const data = response.data;

                if (data.status === 'success') {
                    const token = data.api_token;
                    this.$store.dispatch('login', token);
                    this.$store.dispatch('user', data.user);

                    if (this.rememberMe) {
                        localStorage.setItem('email', this.email);
                        localStorage.setItem('password', this.password);
                        localStorage.setItem('rememberMe', 'true');
                    } else {
                        localStorage.removeItem('email');
                        localStorage.removeItem('password');
                        localStorage.removeItem('rememberMe');
                    }

                } else {
                    console.error('Ошибка при входе:', data.message);
                    this.$store.dispatch('logout');
                }
            } catch (error) {
                console.error('Ошибка сервера:', error);
                this.$store.dispatch('logout');
            } finally {
                this.$router.push('/');
            }
        }
    }
};
</script>