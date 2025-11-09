<template>
    <v-list>
        <v-list-item 
            :prepend-avatar="userAvatar" 
            :subtitle="userEmail"
            :title="userName" 
            to="/profile"
        >
        </v-list-item>
        <v-list-item 
            v-for="(item, index) in allowedOptions" 
            :key="index" 
            @click="handleClick(item)"
            :prepend-icon="item.icon" 
            :title="item.title" 
            :value="item.title"
        >
        </v-list-item>
    </v-list>
</template>

<script>
import { useAuthStore } from '@/stores/auth';
import permission from './permissions.mjs'

export default {
    name: 'MenuIsUserAuth',
    mixins: [permission],
    data() {
        return {
            actions: [
                {
                    title: 'Пользователи',
                    icon: 'mdi-account',
                    permission: 'isAdmin',
                    to: '/admin/users'
                },
                {
                    title: 'Напоминалка Телеграмм',
                    icon: 'mdi-account',
                    permission: 'isAdmin',
                    to: '/admin/reminders'
                },
                {
                    title: 'Выйти',
                    icon: 'mdi-logout',
                    permission: 'isUserAuth',
                    to: 'logout'
                },
            ],
        };
    },
    computed: {
        allowedOptions() {
            return this.actions.filter(action => this[action.permission]);
        },
        // Добавляем computed свойства для Pinia store
        userAvatar() {
            const authStore = useAuthStore();
            return authStore.getUserAvatar;
        },
        userEmail() {
            const authStore = useAuthStore();
            return authStore.getUserEmail;
        },
        userName() {
            const authStore = useAuthStore();
            return authStore.getUserName;
        }
    },
    methods: {
        logout() {
            const authStore = useAuthStore();
            authStore.logout();
            this.$router.push('/');
        },
        handleClick(item) {
            if (item.to === 'logout') {
                this.logout();
            } else if (item.to) {
                this.$router.push(item.to);
            }
        }
    },
};
</script>

<style scoped></style>