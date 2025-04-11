<template>
    <v-container>
        <v-row>
            <v-col cols="12">
                <v-btn color="primary" @click="openCreateDialog">
                    <v-icon start>mdi-plus</v-icon>
                    Добавить напоминание
                </v-btn>
            </v-col>
        </v-row>

        <!-- Диалог создания/редактирования -->
        <v-dialog v-model="showDialog" max-width="600">
            <v-card>
                <v-card-title class="d-flex justify-space-between">
                    <span>{{ editingId ? 'Редактировать напоминание' : 'Новое напоминание' }}</span>
                    <v-spacer></v-spacer>
                    <v-btn icon @click="showDialog = false" variant="text" density="compact">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <v-form @submit.prevent="saveReminder">
                        <v-text-field v-model="form.title" label="Название" required
                            :rules="[v => !!v || 'Обязательное поле']"></v-text-field>

                        <v-textarea v-model="form.description" label="Описание" rows="2"></v-textarea>
                        <v-row>
                            <v-col>
                                <v-date-picker v-model="form.date" :min="new Date()" locale="ru" title="Дата" required
                                    @update:modelValue="handleDateChange"></v-date-picker>
                            </v-col>
                            <v-col>
                                <div class="flex-column">
                                    <v-text-field v-model="form.hour" label="Час (07-23)" type="number" min="7" max="23"
                                        :rules="[
                                            v => !!v || 'Укажите час',
                                            v => (v >= 7 && v <= 23) || 'Допустимо с 07 до 23'
                                        ]"></v-text-field>

                                    <v-select v-model="form.repeat" :items="repeatOptions" item-title="text"
                                        item-value="value" label="Повторение"></v-select>
                                </div>
                            </v-col>
                        </v-row>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="error" @click="showDialog = false">Отмена</v-btn>
                            <v-btn color="primary" type="submit">Сохранить</v-btn>
                        </v-card-actions>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-dialog>

        <!-- Список напоминаний -->
        <v-row>
            <v-col cols="12">
                <v-list lines="two">
                    <v-list-item v-for="reminder in sortedReminders" :key="reminder.id"
                        @click="openEditDialog(reminder)">
                        <template v-slot:prepend>
                            <v-icon :color="getReminderColor(reminder)">mdi-alarm</v-icon>
                        </template>

                        <v-list-item-title>{{ reminder.title }}</v-list-item-title>

                        <v-list-item-subtitle v-if="reminder.description">
                            {{ reminder.description }}
                        </v-list-item-subtitle>

                        <v-list-item-subtitle :class="`text-` + getReminderColor(reminder)">
                            {{ formatDateTime(reminder.reminder_time) }}
                            <v-chip v-if="reminder.repeat !== 'none'" size="x-small" class="ml-2"
                                :color="getRepeatColor(reminder.repeat)">
                                {{ getRepeatText(reminder.repeat) }}
                            </v-chip>
                        </v-list-item-subtitle>



                        <template v-slot:append>
                            <v-btn icon variant="text" color="error" @click.stop="deleteReminder(reminder.id)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </template>
                    </v-list-item>
                </v-list>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { format, parseISO, isBefore } from 'date-fns'
    import { ru } from 'date-fns/locale'
    import api from '../api'

    const reminders = ref([])
    const showDialog = ref(false)
    const editingId = ref(null)

    const form = ref({
        title: '',
        description: '',
        date: new Date().toISOString().substr(0, 10),
        hour: '12',
        repeat: 'none'
    })

    const repeatOptions = [
        { value: 'none', text: 'Не повторяется' },
        { value: 'daily', text: 'Ежедневно' },
        { value: 'weekly', text: 'Еженедельно' },
        { value: 'monthly', text: 'Ежемесячно' },
        { value: 'yearly', text: 'Ежегодно' }
    ]

    // Сортированные напоминания (сначала ближайшие)
    const sortedReminders = computed(() => {
        return [...reminders.value].sort((a, b) => {
            return new Date(a.reminder_time) - new Date(b.reminder_time)
        })
    })

    const fetchReminders = async () => {
        try {
            const response = await api.getReminders()
            reminders.value = response.data
        } catch (error) {
            console.error('Ошибка при загрузке напоминаний:', error)
        }
    }

    const openCreateDialog = () => {
        resetForm()
        editingId.value = null
        showDialog.value = true
    }

    const openEditDialog = (reminder) => {
        const dateTime = new Date(reminder.reminder_time)
        form.value = {
            title: reminder.title,
            description: reminder.description,
            date: dateTime,
            dateString: new Date().toISOString().split('T')[0],
            hour: format(dateTime, 'H'),
            repeat: reminder.repeat
        }
        editingId.value = reminder.id
        showDialog.value = true
    }

    const saveReminder = async () => {
        try {
            // Форматируем час с ведущим нулём
            const formattedHour = form.value.hour.toString().padStart(2, '0')

            // Создаём объект Date из выбранной даты
            const selectedDate = new Date(form.value.date)

            // Устанавливаем часы и минуты
            selectedDate.setHours(form.value.hour)
            selectedDate.setMinutes(0)
            selectedDate.setSeconds(0)

            const reminderData = {
                title: form.value.title,
                description: form.value.description,
                reminder_time: selectedDate.toISOString(),
                repeat: form.value.repeat
            }

            if (editingId.value) {
                await api.updateReminder(editingId.value, reminderData)
            } else {
                await api.addReminder(reminderData)
            }

            showDialog.value = false
            fetchReminders()
        } catch (error) {
            console.error('Ошибка при сохранении напоминания:', error)
            alert('Ошибка при сохранении: ' + (error.response?.data?.message || error.message))
        }
    }

    const deleteReminder = async (id) => {
        if (confirm('Вы уверены, что хотите удалить это напоминание?')) {
            try {
                await api.deleteReminder(id)
                fetchReminders()
            } catch (error) {
                console.error('Ошибка при удалении напоминания:', error)
            }
        }
    }

    const resetForm = () => {
        form.value = {
            title: '',
            description: '',
            date: new Date().toISOString().substr(0, 10),
            hour: '12',
            repeat: 'none'
        }
    }

    const formatDateTime = (dateString) => {
        const date = parseISO(dateString)
        return format(date, 'dd.MM.yyyy HH:mm', { locale: ru })
    }

    const getReminderColor = (reminder) => {
        return isBefore(new Date(reminder.reminder_time), new Date()) ? 'error' : 'primary'
    }

    const getRepeatText = (repeatType) => {
        const option = repeatOptions.find(opt => opt.value === repeatType)
        return option ? option.text : ''
    }

    const getRepeatColor = (repeatType) => {
        const colors = {
            none: 'grey',
            daily: 'green',
            weekly: 'blue',
            monthly: 'orange',
            yearly: 'red'
        }
        return colors[repeatType]
    }

    const handleDateChange = (date) => {
        form.value.date = date
        form.value.dateString = date.toISOString().split('T')[0]
    }


    onMounted(fetchReminders)
</script>

<style scoped>
    .v-list-item {
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .v-list-item:hover {
        background-color: rgba(0, 0, 0, 0.04);
    }
</style>