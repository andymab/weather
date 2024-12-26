<template>
    <!-- на будующее применяется в редактировании пользователя и в профиле -->
    <div class="position-relative mb-4">
        <div class="image-avatar">
            <v-avatar size="286" class="mb-4" :color="imgUrl ? 'default' : 'primary'">
                <img v-if="imgUrl" :src="imgUrl" alt="Avatar" cover>
                <span v-else class="text-h3">{{ initialsUser }}</span>
            </v-avatar>
        </div>
        <v-btn icon color="primary" density="compact" @click="openImageDialog" class="position-absolute top-0 right-0">
            <v-icon size="x-small">mdi-pencil</v-icon>
        </v-btn>
    </div>
</template>