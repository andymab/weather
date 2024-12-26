<template>
    <v-dialog :model-value="modelValue" max-width="600" @paste="handlePaste" persistent>
        <v-card>
            <v-card-title>
                <span class="headline">Выберите изображение или вставте из буфера обмена</span>
            </v-card-title>
            <v-card-text>

                <v-file-input density="compact" accept="image/*" label="Выберите файл c изображением"
                    @change="onFileChange"  prepend-icon="mdi-image" show-size
                    variant="outlined"></v-file-input>
                <div class="image-box">
                    <div class="image-picker" :class="`image-picker-${modelPicker}`">
                        <v-img v-if="imageUrl" :src="imageUrl" height="300"  cover></v-img>
                    </div>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn text @click="close">Отмена</v-btn>
                <v-btn color="primary" @click="confirm">Подтвердить</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        modelValue: Boolean,
        modelPicker: String,
    },
    emits: ['update:modelValue', 'selected'],
    data() {
        return {
            imageUrl: null,
            file: null,
            picker: this.value,
        };
    },
    methods: {
        close() {
            this.$emit('update:modelValue', false);
        },
        confirm() {
            this.$emit('selected', { imageUrl: this.imageUrl, file: this.file });
            this.close();
        },

        onFileChange(event) {
            const file = event.target.files[0];
            if (file) {
                this.loadImage(file);
            }
        },
        handlePaste(event) {
            const items = (event.clipboardData || event.originalEvent.clipboardData).items;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf("image") === 0) {
                    const blob = items[i].getAsFile();
                    this.file = blob; // Сохраняем файл для отправки на сервер
                    this.loadImage(blob); // Загружаем изображение для отображения
                }
            }
        },
        loadImage(file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.imageUrl = e.target.result; // Устанавливаем URL для отображения
                this.file = file;
            };
            reader.readAsDataURL(file); // Читаем файл как Data URL
        },

    }
};
</script>

<style scoped>
.image-box {
    width: 100%;
    height: 300px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
}

.image-picker-ticket {
    width: 100%;
    height: 100%;
}

.image-picker-avatar {
    width: 200px;
    height: 200px;
}

.image-picker {
    border: 2px dotted rgb(48, 48, 105);
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>