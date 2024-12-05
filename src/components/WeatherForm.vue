<template>
    <div>

        <v-navigation-drawer app v-model="drawer" permanent>
            <v-form @submit.prevent="getWeather" width="100%">
                <v-container fluid>

                    <v-row>
                        <v-col v-for="(location, index) in selectedLocations">
                            <v-select v-model="selectedLocations[index]" :items="locations" label="Выберите место"
                                required item-text="title" item-value="value"></v-select>
                        </v-col>
                    </v-row>
                    <v-btn @click="addLocation">Добавить место</v-btn>
                    <v-btn type="submit" class="ma-4" color="primary">Получить погоду</v-btn>

                </v-container>
            </v-form>

        </v-navigation-drawer>

        <v-container fluid>
            <v-toolbar app>
                <v-toolbar-title>Прогноз погоды</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="drawer = !drawer">
                    <v-icon>mdi-cog</v-icon>
                </v-btn>
            </v-toolbar>
            <div v-if="weatherData.length > 0">
                <WeatherChart :weatherData="weatherData" :selectedLocations="selectedLocations"
                    :title="`Температура (°C)`" />
                <WeatherDataTable :weatherData=weatherData :selectedLocations="selectedLocations" />
            </div>
            <v-alert
                text="Наблюдение за изменениями: Резкое увеличение относительной влажности или абсолютной влажности в сочетании с падением температуры и снижением атмосферного давления может служить хорошим индикатором приближающегося дождя."></v-alert>
        </v-container>
    </div>


</template>

<script>
import axios from 'axios';
import WeatherChart from './WeatherChart.vue';
import WeatherDataTable from './WeatherDataTable.vue';
import locations from '../config/locations';


export default {
    name: 'WeatherForm',
    components: {
        WeatherDataTable, WeatherChart,
    },
    data() {
        return {
            drawer: false,
            selectedLocations: [''],

            selectedComparisonLocation: null,
            latitude: null,
            longitude: null,
            weatherData: [],
            comparisonWeatherData: null,
            locations,
            navItems: [
                { title: 'Главная', route: '/' },
                //{ title: 'Настройки', route: '/settings' },
                // Добавьте другие элементы навигации по мере необходимости
            ],
        };
    },
    methods: {
        addLocation() {
            this.selectedLocations.push('');
        },

        async getWeather() {
            this.weatherData = [];
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