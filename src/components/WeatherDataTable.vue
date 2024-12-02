<template>
    <v-container>
        <v-data-table :headers="headers" :items="weatherDataMap" :items-per-page="5" class="elevation-1">
            <template v-slot:top>
                <v-toolbar flat>
                    <v-toolbar-title>Данные о погоде</v-toolbar-title>
                    <v-divider inset vertical />
                    <v-spacer />
                    <v-btn @click="fetchWeatherData" color="primary">Обновить данные</v-btn>
                </v-toolbar>
            </template>

            <template v-slot:item.time="{ item }">
                {{ formatDate(item.time) }}
            </template>

            <template v-slot:no-data>
                <v-alert type="info" icon="info">
                    Нет доступных данных.
                </v-alert>
            </template>
        </v-data-table>
    </v-container>
</template>

<script>
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
    name: 'WeatherDataTable',
    props: {
        weatherData: Array,

    },
    data() {
        return {
            headers: [
                { title: 'Дата и время', key: 'time' },
                { title: 'Температура (°C)', key: 'air_temperature' },
                { title: 'Давление (hPa)', key: 'air_pressure' },
                { title: 'Влажность (%)', key: 'relative_humidity' },
                { title: 'Скорость ветра (m/s)', key: 'wind_speed' },
            ],
        };
    },
    computed: {
        weatherDataMap() {
            return this.weatherData.properties.timeseries.map(item => ({
                time: item.time,
                air_temperature: item.data.instant.details.air_temperature,
                air_pressure: item.data.instant.details.air_pressure_at_sea_level,
                relative_humidity: item.data.instant.details.relative_humidity,
                wind_speed: item.data.instant.details.wind_speed,
            }));

        },

    },
    methods: {
        formatDate(dateString) {
            return format(parseISO(dateString), "dd MMMM yyyy HH:mm", { locale: ru });
        },
    },
    mounted() {

    },
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
</style>