<template>
    <div class="global-notifications">
        <transition-group name="slide-up">
            <v-alert 
                v-for="notification in notifications" 
                :key="notification.id" 
                :class="getColor(notification.type)"
                :icon="getIcon(notification.type)"  
                dismissible 
                elevation="6" 
                class="mb-2 mx-2"
                @click:close="removeNotificationById(notification.id)"
            >
                {{ notification.message }}
            </v-alert>
        </transition-group>
    </div>
</template>

<script>
import { ref } from 'vue'

export default {
    name: 'GlobalNotifier',
    
    setup() {
        const notifications = ref([])
        const nextId = ref(1)

        const getColor = (type) => {
            const colors = {
                success: 'bg-success',
                error: 'bg-error',
                warning: 'bg-warning',
                info: 'bg-info'
            };
            return colors[type] || 'info';
        }

        const addNotification = (message, type = 'info', timeout = 5000) => {
            const id = nextId.value++;
            const notification = { id, message, type }
            notifications.value.push(notification)

            if (timeout > 0) {
                setTimeout(() => {
                    removeNotificationById(id);
                }, timeout);
            }

            return id
        }

        const removeNotification = (index) => {
            notifications.value.splice(index, 1);
        }

        const removeNotificationById = (id) => {
            const index = notifications.value.findIndex(n => n.id === id);
            if (index >= 0) removeNotification(index);
        }

        const getIcon = (type) => {
            const icons = {
                success: 'mdi-check-circle',
                error: 'mdi-alert-circle',
                warning: 'mdi-alert',
                info: 'mdi-information'
            };
            return icons[type] || icons.info;
        }

        return {
            notifications,
            getColor,
            addNotification,
            removeNotification,
            removeNotificationById,
            getIcon
        }
    }
};
</script>

<style>
.bg-success {
    background-color: #2ca93a !important;
    color: white !important;
}

.bg-error {
    background-color: #ff3939 !important;
    color: white !important;
}

.bg-error .v-icon, 
.bg-warning .v-icon, 
.bg-success .v-icon, 
.bg-info .v-icon {
    color: white !important;
}

.bg-info {
    background-color: #2a75cd !important;
    color: white !important;
}

.bg-warning {
    background-color: #fb8c00 !important;
    color: white !important;
}
</style>

<style scoped>
.global-notifications {
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 350px;
    z-index: 1000;
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
    opacity: 0;
    transform: translateY(30px);
}
</style>