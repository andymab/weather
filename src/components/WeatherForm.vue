<template>
    <v-container>
        <v-form @submit.prevent="getWeather">
            <v-row>
                <v-col cols="12" md="4" v-for="(location, index) in selectedLocations">
                    <v-select v-model="selectedLocations[index]" :items="locations" label="Выберите место" required
                        item-text="title" item-value="value"></v-select>
                </v-col>
                <!-- <v-col cols="12" md="4">
                    <v-select v-model="selectedComparisonLocation" :items="locations"
                        label="Выберите место для сравнения" required item-text="title" item-value="value"></v-select>
                </v-col>
                <v-col cols="12" md="4" v-if="!selectedLocations">
                    <v-text-field v-model="latitude" label="Широта" type="number" required />
                </v-col>
                <v-col cols="12" md="4" v-if="!selectedLocations">
                    <v-text-field v-model="longitude" label="Долгота" type="number" required />
                </v-col> -->
            </v-row>
            <v-btn @click="addLocation">Добавить место</v-btn>
            <v-btn type="submit" class="ma-4" color="primary">Получить погоду</v-btn>
        </v-form>

        <div v-if="weatherData.length > 0">
            <WeatherChart :weatherData="weatherData" :selectedLocations="selectedLocations" />
            <!-- <div v-if="comparisonWeatherData">
                <WeatherChart :weatherData="comparisonWeatherData" />
            </div> -->
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
            selectedLocations: [''],

            selectedComparisonLocation: null,
            latitude: null,
            longitude: null,
            weatherData: [],
            comparisonWeatherData: null,
            locations: [
                { title: 'Адлер', value: { label:'Адлер',lat: 43.39646, lon: 39.97040 } },
                { title: 'Сочи', value: { label:'Сочи', lat: 43.57782, lon: 39.72106 } },
                { title: 'Архыз', value: { label:'Архыз', lat: 43.52359, lon: 41.23145 } },
                { title: 'Домбай', value: { label:'Домбай', lat: 43.29091, lon: 41.62691 } },
                { title: 'Судак', value: { label:'Судак',  lat: 44.83977, lon: 34.9157 } },
                { title: 'Новый Свет', value: { label:'Новый Свет',  lat: 44.8317, lon: 34.9157 } },
                { title: 'Ялта', value: { label:'Ялта',  lat: 44.49444, lon: 34.15374 } },
                { title: 'Ласпи', value: {  label:'Ласпи', lat: 44.41270, lon: 33.71343 } },
                { title: 'Форос', value: {  label:'Форос', lat: 44.39223, lon: 33.79233 } },
                { title: 'Севастополь', value: {  label:'Севастополь', lat: 44.63154, lon: 33.51329 } },
                { title: 'Алушта', value: {  label:'Алушта', lat: 44.67144, lon: 34.41246 } },
                { title: 'Ставрополь-дом', value: {  label:'Ставрополь-дом', lat: 44.99941, lon: 41.92428 } },
                { title: 'Ставрополь-дача', value: {  label:'Ставрополь-дача', lat: 45.00224, lon: 41.96936 } },
                { title: 'Ставрополь-техникум', value: {  label:'Ставрополь-техникум', lat: 45.02932, lon: 41.97437 } },
                { title: 'Ставрополь-Аврора', value: {  label:'Ставрополь-Аврора', lat: 45.00224, lon: 42.00529 } },
            ],
        };
    },
    methods: {
        addLocation() {
            this.selectedLocations.push('');
        },

        async getWeather() {
            this.weatherData= [];
            // if (this.selectedLocation) {
            //     const coords = this.selectedLocation;
            //     this.latitude = coords.lat;
            //     this.longitude = coords.lon;
            // }

            // Получаем данные для местоположения для сравнения
            if (this.selectedComparisonLocation) {
                const comparisonCoords = this.selectedComparisonLocation;
                this.comparisonLatitude = comparisonCoords.lat;
                this.comparisonLongitude = comparisonCoords.lon;
            }


            try {
                const allWeatherData = [];
                for (const index in this.selectedLocations) {

                    const response = await axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact`, {
                        params: {
                            lat: this.selectedLocations[index].lat,
                            lon: this.selectedLocations[index].lon,
                        },
                    });

                    //Получаем данные о погоде для каждого местоположения
                    allWeatherData.push(response.data);
                }

                this.weatherData.push(...allWeatherData);
               // this.selectedLocs = this.selectedLocations;

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