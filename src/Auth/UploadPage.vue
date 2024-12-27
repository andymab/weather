<template>
    <v-container fluid class="d-flex flex-column align-center justify-center">
        <v-row class="flex-grow-1">
            <v-col v-for="(dir, index) in directories" :key="index" cols="4" md="2"
                class="d-flex justify-center align-center">
                <v-card @click="toggleDirectory(dir)" class="pa-3" outlined
                    :class="{ 'bg-light-blue': openedDirectory === dir }">
                    <v-icon size="48" class="mb-2">
                        {{ openedDirectory === dir ? 'mdi-folder-open' : 'mdi-folder' }}
                    </v-icon>
                    <div>{{ dir.title }}</div>
                    <v-btn icon @click.stop="confirmDeleteDirectory(dir)">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </v-card>
                <v-list v-if="openedDirectory === dir">
                    <v-list-item-group>
                        <v-list-item v-for="(subDir, subIndex) in dir.directories" :key="subIndex">
                            <v-icon size="24">{{ openedDirectory === subDir ? 'mdi-folder-open' : 'mdi-folder'
                                }}</v-icon>
                            <div @click.stop="toggleDirectory(subDir)">{{ subDir.title }}</div>
                            <v-btn icon @click.stop="confirmDeleteDirectory(subDir)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </v-list-item>
                        <v-list-item v-for="(file, fileIndex) in dir.files" :key="fileIndex">
                            <v-icon size="24">mdi-file</v-icon>
                            <div>{{ file.title }}</div>
                            <v-btn icon @click.stop="confirmDeleteFile(file)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </v-list-item>
                    </v-list-item-group>
                </v-list>
            </v-col>
        </v-row>

        <!-- Форма для создания новой директории -->
        <v-form @submit.prevent="openCreateDialog">
            <v-text-field v-model="newDirName" label="Название новой директории" required></v-text-field>
            <v-btn type="submit" color="primary">Создать директорию</v-btn>
        </v-form>

        <!-- Диалоговое окно для создания новой директории -->
        <v-dialog v-model="dialog" max-width="500px">
            <v-card>
                <v-card-title class="headline">Создать директорию</v-card-title>
                <v-card-text>
                    <v-text-field v-model="newDirName" label="Название директории" required></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-btn text @click="dialog = false">Отмена</v-btn>
                    <v-btn text @click="confirmCreateDirectory">Создать</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Диалоговое окно для подтверждения удаления директории -->
        <v-dialog v-model="dialogDeleteDir" max-width="290">
            <v-card>
                <v-card-title>Подтверждение удаления</v-card-title>
                <v-card-text>Вы уверены, что хотите удалить эту директорию?</v-card-text>
                <v-card-actions>
                    <v-btn text @click="dialogDeleteDir = false">Отмена</v-btn>
                    <v-btn text @click="deleteSelectedDirectory">Удалить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <!-- Диалоговое окно для подтверждения удаления файла -->
        <v-dialog v-model="dialogDeleteFile" max-width="290">
            <v-card>
                <v-card-title>Подтверждение удаления файла</v-card-title>
                <v-card-text>Вы уверены, что хотите удалить этот файл?</v-card-text>
                <v-card-actions>
                    <v-btn text @click="dialogDeleteFile = false">Отмена</v-btn>
                    <v-btn text @click="deleteSelectedFile">Удалить</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

    </v-container>
</template>

<script>

import axios from "axios";

export default {
    name: 'UploadPage',
    props: {
        dataToSave: {
            type: Array,
        },
    },
    data() {
        return {
            newDirName: '',
            directories: [{
                title: 'Директория 1',
                directories: [],
                files: []
            }],
            openedDirectory: null,
            dialog: false,
            dialogDeleteDir: false,
            dialogDeleteFile: false,
            selectedDir: null,
            selectedFile: null,
        }
    },
    mounted() {
        this.loadDirectories();
    },
    methods: {
        // Метод для сохранения данных в виде JSON-файла на сервере
        async saveData() {
            try {
                const jsonData = JSON.parse(this.dataToSave); // Преобразуем строку в объект

                await axios.post('/api/save-data', {
                    data: jsonData,
                    directory_name: this.openedDirectory?.title || '', // Имя открытой директории или пустая строка
                    parent_directory: this.openedDirectory?.parent || '' // Имя родительской директории или пустая строка
                });
            } catch (error) {
                console.error('Ошибка сохранения данных:', error);
            }
        },
        async loadDirectories() {
            try {
                const response = await axios.get('/api/directories');
                this.directories = response.data; // Установите загруженные данные в переменную directories
            } catch (error) {
                console.error('Ошибка загрузки директорий:', error);
            }
        },
        openCreateDialog() {
            this.dialog = true;
        },
        toggleDirectory(dir) {
            this.openedDirectory = this.openedDirectory === dir ? null : dir;
        },
        confirmCreateDirectory() {
            if (this.newDirName) {
                this.createNewDirectory(this.newDirName);
                this.dialog = false;
            }
        },
        async createNewDirectory(name) {
            const newDir = { title: name, directories: [], files: [] };

            // Если открыта директория, добавляем новую директорию в нее
            if (this.openedDirectory) {
                this.openedDirectory.directories.push(newDir);

                // Отправка запроса на создание директории на сервере
                await axios.post('/api/create-directory', {
                    directory_name: name,
                    parent_directory: this.openedDirectory.title
                });

            } else {
                // Если нет открытой директории, добавляем в корень
                this.directories.push(newDir);

                // Отправка запроса на создание директории на сервере
                await axios.post('/api/create-directory', {
                    directory_name: name
                });
            }

            this.newDirName = ''; // Сбросить поле ввода
        },
        confirmDeleteDirectory(dir) {
            this.selectedDir = dir;
            this.dialogDeleteDir = true;
        },
        async deleteSelectedDirectory() {
            try {
                await axios.delete('/api/delete-directory', { data: { directory_name: this.selectedDir.title } });

                // Удаляем из локального списка
                if (this.openedDirectory === this.selectedDir) {
                    this.openedDirectory = null; // Закрыть открытую папку
                }

                const parent = this.findParent(this.directories, this.selectedDir);

                if (parent) {
                    parent.directories = parent.directories.filter(d => d !== this.selectedDir);
                } else {
                    this.directories = this.directories.filter(d => d !== this.selectedDir);
                }

            } catch (error) {
                console.error('Ошибка удаления директории:', error);
            } finally {
                this.dialogDeleteDir = false;
            }
        },

        findParent(directories, dir) {
            for (const d of directories) {
                if (d.directories.includes(dir)) {
                    return d;
                }

                const found = this.findParent(d.directories, dir);

                if (found) return found;
            }

            return null;
        },

        confirmDeleteFile(file) {
            this.selectedFile = file;
            this.dialogDeleteFile = true;
        },

        async deleteSelectedFile() {
            try {
                await axios.delete('/api/delete-file', { data: { file_name: this.selectedFile.title } });

                // Логика удаления файла из локального массива директорий
                const parent = this.findParent(this.directories, this.selectedFile);

                if (parent) {
                    parent.files = parent.files.filter(f => f !== this.selectedFile);
                }

            } catch (error) {
                console.error('Ошибка удаления файла:', error);
            } finally {
                this.dialogDeleteFile = false;
            }
        },
    },
}
</script>

<style scoped>
.v-card {
    cursor: pointer;
}

.bg-light-blue {
    background-color: #e3f2fd !important;
    /* Цвет фона для открытой папки */
}
</style>
