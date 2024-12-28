<template>
    <div>
        <v-dialog v-model="dialogMain" fullscreen hide-overlay>
            <v-card>
                <v-card-title class="bg-grey-lighten-2">
                    <div class="d-flex">
                        <span class="headline">Сохраненные маршруты</span>

                        <v-icon size="x-small" @click="openCreateDialog" v-tooltip.bottom="`Создать новую директорию`"
                            class="ma-2 text-teal-lighten-3">mdi-plus-circle-outline </v-icon>

                        <v-icon size="x-small" @click="isdialogFileName = true"
                            v-tooltip.bottom="`Выгрузить маршрут с высотами (JSON)`"
                            class="ma-2 text-teal-lighten-3">mdi-tray-arrow-down </v-icon>

                        <v-spacer></v-spacer>
                        <v-btn icon="mdi-close" size="x-small" flat @click="closeDialogMain">

                        </v-btn>
                    </div>

                </v-card-title>

                <v-card-text>
                    <v-container fluid class="d-flex flex-column align-center justify-center">
                        <v-row class="flex-grow-1 w-100">
                            <v-col v-for="(dir, index) in directories" :key="index" cols="12" md="3">
                                <div class="d-flex justify-center align-start flex-column">
                                    <v-card flat @click="toggleDirectory(dir)"
                                        class="pa-3 w-100 d-flex align-center bg-grey-lighten-5" outlined
                                        :class="{ 'bg-grey-lighten-3': openedDirectory === dir }">

                                        <v-icon size="48" class="mr-2"
                                            :color="openedDirectory === dir ? 'yellow-darken-3' :'yellow-darken-2'">
                                            {{ openedDirectory === dir ? 'mdi-folder-open' : 'mdi-folder' }}
                                        </v-icon>

                                        <div style="font-size: 12px; color: gray;">{{ dir.title }}</div>
                                        <v-spacer></v-spacer>
                                        <v-icon size="16" @click.stop="confirmDeleteDirectory(dir)"
                                            color="grey-darken-3">
                                            mdi-close
                                        </v-icon>
                                    </v-card>
                                    <v-list v-if="openedDirectory === dir" class="py-2 bg-grey-lighten-4 w-100"
                                        style="position: relative;">
                                        <v-list-item-group>
                                            <v-list-item v-for="(subDir, subIndex) in dir.directories" :key="subIndex"
                                                @click.stop="toggleSubDirectory(subDir)" density="compact"
                                                :class="openedSubDirectories === subDir ? 'bg-grey-lighten-4' : 'bg-grey-lighten-4'">
                                                <div class="d-flex flex-column">


                                                    <div class="d-flex flex-start align-center">

                                                        <v-icon size="24" class="mr-2"
                                                            :color="openedSubDirectories === subDir ? 'yellow-darken-3' :'yellow-darken-2'">
                                                            {{ openedSubDirectories === subDir ? 'mdi-folder-open' :
                                                            'mdi-folder' }}
                                                        </v-icon>


                                                        <div style="font-size: 12px; color: gray;">{{ subDir.title }}
                                                        </div>
                                                        <v-spacer> </v-spacer>

                                                        <v-icon size="16" @click.stop="confirmDeleteDirectory(subDir)"
                                                            color="grey-darken-3">
                                                            mdi-close
                                                        </v-icon>
                                                    </div>

                                                    <v-list v-if="openedSubDirectories === subDir"
                                                        class="bg-grey-lighten-4 w-100">
                                                        <v-list-item-group>
                                                            <v-list-item v-for="(file, fileIndex) in subDir.files"
                                                                :key="`file-`+fileIndex" density="compact"
                                                                @click="uploadFile(file.url)" class="bg-grey-lighten-4">
                                                                <div class="d-flex align-center">
                                                                    <v-icon size="24" class="mr-2"
                                                                        color="blue-grey-lighten-1">
                                                                        mdi-file-tree-outline
                                                                    </v-icon>
                                                                    <div style="font-size: 12px; color: gray;">
                                                                        {{file.title }}</div>


                                                                    <v-spacer> </v-spacer>

                                                                    <v-icon size="16"
                                                                        @click.stop="confirmDeleteFile(file)"
                                                                        color="grey-darken-3">
                                                                        mdi-close
                                                                    </v-icon>
                                                                </div>

                                                            </v-list-item>
                                                        </v-list-item-group>
                                                    </v-list>

                                                </div>
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

                                </div>
                            </v-col>
                        </v-row>

                        <!-- Форма для создания новой директории -->
                        <!-- <v-form @submit.prevent="openCreateDialog">
                        <v-text-field v-model="newDirName" label="Название новой директории" required></v-text-field>
                        <v-btn type="submit" color="primary">Создать директорию</v-btn>
                    </v-form> -->

                        <!-- Диалоговое окно для создания новой директории -->
                        <v-dialog v-model="dialog" max-width="500px">
                            <v-card>
                                <v-card-title class="headline">Создать директорию</v-card-title>
                                <v-card-text>
                                    <v-text-field v-model="newDirName" label="Название директории"
                                        required></v-text-field>
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

                        <v-dialog v-model="isdialogFileName" max-width="400">
                            <v-card>
                                <v-card-title>
                                    <span class="headline">Введите имя файла</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-text-field v-model="trackName" label="Название маршрута" required
                                        :rules="[v => !!v || 'Это поле обязательно']"></v-text-field>
                                </v-card-text>
                                <v-card-actions>
                                    <v-spacer></v-spacer>
                                    <v-btn color="primary" @click="executeSave" :disabled="!trackName">Сохранить</v-btn>
                                    <v-btn text @click="isdialogFileName = false">Отмена</v-btn>
                                </v-card-actions>
                            </v-card>
                        </v-dialog>

                    </v-container>
                </v-card-text>
            </v-card>
        </v-dialog>
        <Notification ref="notification" />
    </div>
</template>

<script>
    import api from './api';
    import Notification from '../components/Notification.vue';
    import axios from "axios";

    export default {
        name: 'UploadPage',
        components: {
            Notification
        },
        props: {
            route: {
                type: Array,
            },
            elevations: {
                type: Array,
            },
            features: {
                type: Array,
            },
        },
        data() {
            return {
                dialogMain: false,
                trackName: '',
                newDirName: '',
                directories: [{
                    title: 'Директория 1',
                    directories: [],
                    files: []
                }],
                isdialogFileName: false,
                openedDirectory: null,
                openedSubDirectories: null,
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
            async uploadFile(url) {
                const result = await api.downloadFileRoute(url);
                this.dialogMain = false;
                this.$emit('updateLoaded', result.data);
            },
            message(message, status) {
                status = typeof status === 'undefined' ? 'success' : status === true ? 'success' : 'error';
                this.$refs.notification.notify(message, status);
            },
            async executeSave() {
                this.isdialogFileName = false;
                const directory_name = this.openedSubDirectories ? this.openedSubDirectories : this.openedDirectory;
                const parent_directory = this.openedSubDirectories ? this.openedDirectory : null;
                const file_name = this.trackName;
                const route = { location: this.route, elevation: this.elevations, features: this.features };

                if ((directory_name || parent_directory) && file_name) {
                    const result = await api.uploadRoute({ route, directory_name: directory_name.title, parent_directory: parent_directory.title, file_name });

                    if (this.openedSubDirectories) {
                        this.openedSubDirectories.files.push(result.data);
                    } else {
                        this.openedDirectory.files.push(result.data);
                    }

                } else {
                    this.message('Введите имя файла или выберите директорию', false);
                    console.error('нет открытых директорий или наименования файла');

                }
            },

            openDialogMain() {
                this.dialogMain = true;
            },
            closeDialogMain() {
                this.dialogMain = false;
            },
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
                    const response = await api.downloadSavedRoute();
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

            toggleSubDirectory(subDir) {
                this.openedSubDirectories = this.openedSubDirectories === subDir ? null : subDir;

                // const dirId = dir.title; // Предполагается, что у вашего каталога есть уникальный идентификатор
                // if (!this.openedSubDirectories[dirId]) {
                //     this.openedSubDirectories[dirId] = [];
                // }
                // const subDirId = subDir.id; // Предполагается, что у подкаталога есть уникальный идентификатор
                // const index = this.openedSubDirectories[dirId].indexOf(subDirId);
                // if (index > -1) {
                //     this.openedSubDirectories[dirId].splice(index, 1); // Закрываем подкаталог
                // } else {
                //     this.openedSubDirectories[dirId].push(subDirId); // Открываем подкаталог
                // }
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
                    await api.createDirectory({
                        directory_name: name,
                        parent_directory: this.openedDirectory.title
                    });

                } else {
                    // Если нет открытой директории, добавляем в корень
                    this.directories.push(newDir);

                    // Отправка запроса на создание директории на сервере
                    await api.createDirectory({
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
                    const parent = this.findParent(this.directories, this.selectedDir);
                    const directory_name = this.selectedDir.title;

                    if (parent) {
                        const parent_directory = parent.title;
                        await api.deleteDirectory({ data: { directory_name, parent_directory } });
                    } else {
                        await api.deleteDirectory({ data: { directory_name } });
                    }


                    // Удаляем из локального списка
                    if (this.openedDirectory === this.selectedDir) {
                        this.openedDirectory = null; // Закрыть открытую папку
                    }



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
            findParentFile(directories, selectedFile) {
                for (const dir of directories) {
                    if (dir.files.includes(selectedFile)) {
                        return dir; // Возвращаем родительский каталог
                    }
                    // Рекурсивно ищем в подкаталогах
                    const parent = this.findParentFile(dir.directories, selectedFile);
                    if (parent) {
                        return parent;
                    }
                }
                return null; // Если родитель не найден
            },
            confirmDeleteFile(file) {
                this.selectedFile = file;
                this.dialogDeleteFile = true;
            },

            async deleteSelectedFile() {
                try {
                    await api.deleteFileRoute(this.selectedFile.url);

                    // Логика удаления файла из локального массива директорий
                    const parent = this.findParentFile(this.directories, this.selectedFile);

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