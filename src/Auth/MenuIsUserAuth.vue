<template>
    <v-list>
        <v-list-item :prepend-avatar="$store.getters.getUserAvatar" :subtitle="$store.getters.getUserEmail"
            :title="$store.getters.getUserName" to="/profile">
        </v-list-item>
        <v-list-item v-for="(item, index) in allowedOptions" :key="index" @click="handleClick(item)"
            :prepend-icon="item.icon" :title="item.title" :value="item.title">
        </v-list-item>
    </v-list>
</template>

<script>
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
        }
    },
    methods: {
        logout() {
            this.$store.dispatch('logout');
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