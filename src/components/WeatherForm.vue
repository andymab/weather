<template>
    <v-container>
        <v-form @submit.prevent="getWeather">
            <v-row>
                <v-col cols="12" md="4">
                    <v-select v-model="selectedLocation" :items="locations" label="Выберите место" required
                        item-text="title" item-value="value"></v-select>
                </v-col>
                <v-col cols="12" md="4">
                    <v-select v-model="selectedComparisonLocation" :items="locations"
                        label="Выберите место для сравнения" required item-text="title" item-value="value"></v-select>
                </v-col>
                <v-col cols="12" md="4" v-if="!selectedLocation">
                    <v-text-field v-model="latitude" label="Широта" type="number" required />
                </v-col>
                <v-col cols="12" md="4" v-if="!selectedLocation">
                    <v-text-field v-model="longitude" label="Долгота" type="number" required />
                </v-col>
            </v-row>
            <v-btn type="submit" color="primary">Получить погоду</v-btn>
        </v-form>

        <div v-if="weatherData">
            <WeatherChart :weatherData="weatherData" />
            <div v-if="comparisonWeatherData">
                <WeatherChart :weatherData="comparisonWeatherData" />
            </div>
            <WeatherDataTable :weatherData=weatherData />
        </div>
    </v-container>
</template>

<script>
import axios from 'axios';
import WeatherChart from './WeatherChart.vue';
import WeatherDataTable from './WeatherDataTable.vue';

export default {
    components: {
        WeatherDataTable, WeatherChart,
    },
    data() {
        return {
            selectedLocation: null,
            selectedComparisonLocation: null,
            latitude: null,
            longitude: null,
            weatherData: null,
            comparisonWeatherData: null,
            locations: [
                { title: 'Адлер', value: { lat: 43.4002, lon: 39.9994 } },
                { title: 'Сочи', value: { lat: 43.5853, lon: 39.7203 } },
                { title: 'Архыз', value: { lat: 43.4119, lon: 41.3994 } },
                { title: 'Домбай', value: { lat: 43.3721, lon: 41.7405 } },
                { title: 'Судак', value: { lat: 44.8955, lon: 35.1704 } },
                { title: 'Новый Свет', value: { lat: 44.9072, lon: 34.9707 } },
                { title: 'Ялта', value: { lat: 44.4991, lon: 34.1664 } },
                { title: 'Ласпи', value: { lat: 44.41, lon: 33.7 } },
                { title: 'Форос', value: { lat: 44.4266, lon: 33.8628 } },
                { title: 'Севастополь', value: { lat: 44.6162, lon: 33.5255 } },
                { title: 'Алушта', value: { lat: 44.6743, lon: 34.4066 } },
            ],
        };
    },
    methods: {
        async getWeather() {
            if (this.selectedLocation) {
                const coords = this.selectedLocation;
                this.latitude = coords.lat;
                this.longitude = coords.lon;
            }
            // Получаем данные для местоположения для сравнения
            if (this.selectedComparisonLocation) {
                const comparisonCoords = this.selectedComparisonLocation;
                this.comparisonLatitude = comparisonCoords.lat;
                this.comparisonLongitude = comparisonCoords.lon;
            }


            try {
                const response = await axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact`, {
                    params: {
                        lat: this.latitude,
                        lon: this.longitude,
                    },
                });
                this.weatherData = response.data;


                // Получаем данные для местоположения для сравнения если выбрано
                if (this.selectedComparisonLocation) {
                    const comparisonResponse = await axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact`, {
                        params: {
                            lat: this.comparisonLatitude,
                            lon: this.comparisonLongitude,
                        },
                    });
                    this.comparisonWeatherData = comparisonResponse.data;
                }

            } catch (error) {
                console.error('Ошибка получения данных о погоде:', error);
                alert('Не удалось получить данные о погоде. Проверьте координаты.');
            }
        },
    },
};
</script>

<style scoped>
/* Добавьте стили по необходимости */
</style>