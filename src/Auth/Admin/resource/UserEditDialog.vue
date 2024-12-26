<template>
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title>
                <span class="headline">{{ user ? 'Редактировать пользователя' : 'Добавить пользователя' }}</span>
            </v-card-title>
            <v-card-text>
                <v-form ref="form" v-model="valid">
                    <v-container fluid>
                        <v-row>
                            <v-col>
                                <div class="position-relative mb-4">
                                    <div class="image-avatar">
                                        <v-avatar size="200" class="mb-4" :color="imageUrl ? 'default' : 'primary'">
                                            <img v-if="imageUrl" :src="imageUrl" alt="Avatar" cover>
                                            <span v-else class="text-h3">{{ initialsUser }}</span>
                                        </v-avatar>
                                    </div>
                                    <v-btn icon color="primary" density="compact" @click="openImageDialog"
                                        class="position-absolute top-0 right-0">
                                        <v-icon size="x-small">mdi-pencil</v-icon>
                                    </v-btn>
                                </div>

                                <!-- <div @paste="handlePaste" class="img-box">
                                    <img :src="imageUrl" alt="Pasted Image" class="responsive-img" />
                                </div> -->

                            </v-col>
                            <v-col>
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="user.name" label="Имя" :rules="[rules.required]"
                                            :error-messages="errors.name" variant="outlined" />
                                    </v-col>

                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-text-field v-model="user.email" label="Email"
                                            :rules="[rules.required, rules.email]" :error-messages="errors.email"
                                            variant="outlined" />
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col>
                                <v-checkbox v-model="user.paid" label="Оплачено" :error-messages="errors.paid" />
                            </v-col>
                            <v-col>
                                <div>
                                    <v-text-field v-model="formattedPaymentTime" label="Дата оплаты" readonly
                                        :error-messages="errors.payment_time" id="menu-activator"
                                        @click="dateMenu = true" variant="outlined" />
                                    <v-menu v-model="dateMenu" :close-on-content-click="false" location="bottom"
                                        activator="#menu-activator">
                                        <template #default>
                                            <v-date-picker v-model="formatedDatePiker"
                                                @update:model-value="handleDateChange" class="custom-date-picker"
                                                color="primary" />
                                        </template>
                                    </v-menu>
                                </div>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col>
                                <v-select v-model="user.role" :items="roles" label="Роль" :rules="[rules.required]"
                                    :error-messages="errors.role" variant="outlined" />
                            </v-col>
                            <v-col>
                                <v-text-field v-model="password" label="Новый пароль" type="password"
                                    :rules="[rules.password]" :error-messages="errors.password"
                                    autocomplete="new-password" variant="outlined" />
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Отмена</v-btn>
                <v-btn color="blue darken-1" text @click="save">Сохранить</v-btn>
            </v-card-actions>
            <image-picker-dialog v-model="showDialog" :model-picker="`avatar`"
                @selected="updateAvatar"></image-picker-dialog>
            <AlertChackbar ref="snackbar" />
        </v-card>
    </v-dialog>
</template>

<script>
import api from "../../api";
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import ImagePickerDialog from '../../util/ImagePickerDialog.vue';
import AlertChackbar from "../../util/AlertChackbar.vue"

export default {
    components: {
        ImagePickerDialog, AlertChackbar
    },
    props: {
        value: Boolean,
        user: Object,
        roles: Array,
    },

    computed: {
        initialsUser() {
            const words = this.user.name.split(' '); // Разделяем строку на слова
            const initials = words.map(word => word.charAt(0).toUpperCase()).join(''); // Получаем первые буквы и объединяем их
            return initials; // Возвращаем инициалы
        },
        formatedDatePiker() {
            if (this.user.payment_time) {
                return parseISO(this.user.payment_time);
            }
            return new Date();

        },
        formattedPaymentTime() {
            return this.user.payment_time
                ? format(this.user.payment_time, 'dd.MM.yyyy', { locale: ru })
                : '';
        }
    },
    data() {
        return {
            showDialog: false,
            imageUrl: null,
            dateMenu: false,
            dialog: this.value,
            file: null,
            password: '',
            mediaContent: null,
            valid: false,
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
            errors: {},

        };
    },
    watch: {
        user(val) {
            if (val.media_content !== this.mediaContent) {
                this.mediaContent = val.media_content;
                this.updateImageUrl();
            }
        }
    },
    methods: {
        triggerSnackbar(message, color) {
            this.$refs.snackbar.showSnackbar(message, color); //// info, primary, secondary, success, warning, error
        },
        updateAvatar({ imageUrl, file }) {
            this.showDialog = false;
            this.imageUrl = imageUrl; // Обновляем URL аватара с помощью выбранного изображения
            this.file = file;

        },
        openImageDialog() {
            this.showDialog = true;
        },
        updateImageUrl() {
            if (this.user.media_content) {
                this.imageUrl = api.getBaseUrl() + "/public/" + this.user.media_content;
            }
        },
        handleDateChange(date) {
            this.user.payment_time = format(new Date(date), 'yyyy-MM-dd', { locale: ru });
            this.dateMenu = false;
        },
        close() {
            this.$emit('close');
        },
        async save() {
            if (this.$refs.form.validate()) {
                const formData = new FormData();

                // Добавление всех полей формы
                // Добавление файла (аватарки)  
                formData.append('file', this.file);
                formData.append('id', this.user.id);
                formData.append('name', this.user.name);
                formData.append('email', this.user.email);
                formData.append('role', this.user.role);
                formData.append('paid', this.user.paid);
                formData.append('payment_time', this.user.payment_time);

                // Если введен новый пароль, добавляем его
                if (this.password) {
                    formData.append('password', this.password);
                }

                try {
                    const response = await api.updateUser(formData);
                    const data = response.data;
                    this.triggerSnackbar(data.message, 'info');
                    this.close();

                } catch (error) {
                    this.errors = error.response.data.errors;
                    console.error("Ошибка при удалении вопроса:", error);
                } finally {
                    this.loading = false;
                }
            }
        },

    },
};
</script>

<style>
.v-picker-title {
    display: none;
    /* Скрываем заголовок */
}

.custom-date-picker .v-picker__title,
.custom-date-picker .v-date-picker-header {
    display: none;
    /* Скрываем заголовок */
}




.img-box {
    width: 100%;
    /* Занимает всю ширину колонки */
    height: 100%;
    min-height: 200px !important;
    /* Занимает всю высоту колонки */
    display: flex;
    /* Используем flexbox для центрирования */
    justify-content: center;
    /* Центрируем по горизонтали */
    align-items: center;
    /* Центрируем по вертикали */
    overflow: hidden;
    /* Скрываем переполнение */
    border: 2px dashed #000;
    transition: border-color 0.3s;
    min-height: 100px;

}

.responsive-img {
    width: 100%;
    /* Занимает всю ширину контейнера */
    height: auto;
    /* Высота автоматически подстраивается */
    max-height: 100%;
    /* Ограничиваем максимальную высоту */
    object-fit: cover;
    /* Обрезаем изображение, сохраняя пропорции */
}

.img-box:hover {
    border-color: #007bff;
    /* Цвет рамки при наведении */
}

.img-box:focus-within {
    border-color: #007bff;
    /* Цвет рамки при фокусе на элементе внутри */
}


.image-avatar {
    width: 230px;
    height: 230px;
}

img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
</style>