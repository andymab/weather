<template>
    <div>
        <v-navigation-drawer app v-model="drawer" permanent>
            <v-form @submit.prevent="getWeather" width="100%">
                <v-container fluid>

                    <v-row>
                        <v-col cols="12" md="12" v-for="(location, index) in selectedLocations">
                            <v-select v-model="selectedLocations[index]" :items="locations" label="Выберите место"
                                required item-text="title" item-value="value"></v-select>
                        </v-col>
                    </v-row>
                    <v-btn @click="addLocation">Добавить место</v-btn>


                    <v-btn type="submit" class="ma-4" color="primary">Получить погоду</v-btn>

                </v-container>
            </v-form>

        </v-navigation-drawer>

        <v-container fluid class="pt-0">
            <v-toolbar app>
                <v-btn icon @click="drawer = !drawer">
                    <v-icon>mdi-cog</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-toolbar-title>Погода {{ period }}</v-toolbar-title>
                

            </v-toolbar>

            <div v-if="weatherData.length && weatherData[0].properties.timeseries.length > 20">
                <WeatherChart :weatherData="weatherData" :selectedLocations="selectedLocations"
                    :title="`Температура (°C)`" />


                <v-row>
                    <v-col md="2" v-for="(item, index) in weatherData[0].properties.timeseries" :key="`card-${index}`">
                        <v-card>
                            <v-card-title>
                                <div>
                                    <small style="font-size:0.8rem;">{{ formatDate(item.time) }}</small>
                                </div>
                            </v-card-title>
                            <v-card-text>
                                <v-row>
                                    <!-- Левая часть - изображение -->
                                    <v-col cols="6" class="pa-1">
                                        <v-img v-if="item.data.next_1_hours && item.data.next_1_hours.summary"
                                            :src="`/public/icons/${item.data.next_1_hours.summary.symbol_code}.svg`"
                                            height="60"></v-img>
                                    </v-col>
                                    <v-col cols="6" class="text-left pa-0">
                                        <h3>{{ item.data.instant.details.air_temperature }}°C</h3>
                                        <h5>обл.{{ item.data.instant.details.cloud_area_fraction }}%</h5>
                                        <h5>{{ item.data.instant.details.wind_speed }}м/с {{
                                            getWindDirection(item.data.instant.details.relative_humidity) }}</h5>
                                        <h5>вл.{{ item.data.instant.details.relative_humidity }}%</h5>
                                    </v-col>
                                </v-row>
                                <!-- <v-card-title>{{ item.data.next_1_hours.summary.symbol_code }}</v-card-title>
                            <v-card-text>Возможность осадков{{ item.data.precipitation_amount }}</v-card-text>  -->
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>

                <WeatherDataTable :weatherData=weatherData :selectedLocations="selectedLocations" />
            </div>



        </v-container>
    </div>


</template>

<script>
import axios from 'axios';
import WeatherChart from './WeatherChart.vue';
import WeatherDataTable from './WeatherDataTable.vue';
import locations from '../config/locations';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

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
    computed: {
        period() {
            if (this.weatherData.length > 0 && this.weatherData[0].properties.timeseries.length > 20) {
                const data  = this.weatherData[0].properties.timeseries;
                const fistTime = this.formatDate(data[0].time);
                const lastTime = this.formatDate(data[data.length - 1].time);
                return `${fistTime} - ${lastTime}`;
            } 
            return '';
        }
    },
    methods: {
        formatDate(dateString) {
            return format(parseISO(dateString), "dd MMMM HH:mm", { locale: ru });
        },
        addLocation() {
            this.selectedLocations.push('');
        },
        getWindDirection(degrees) {
            if (degrees >= 337.5 || degrees < 22.5) return 'С';
            if (degrees >= 22.5 && degrees < 67.5) return 'СВ';
            if (degrees >= 67.5 && degrees < 112.5) return 'В';
            if (degrees >= 112.5 && degrees < 157.5) return 'ЮВ';
            if (degrees >= 157.5 && degrees < 202.5) return 'Ю';
            if (degrees >= 202.5 && degrees < 247.5) return 'ЮЗ';
            if (degrees >= 247.5 && degrees < 292.5) return 'З';
            if (degrees >= 292.5 && degrees < 337.5) return 'СЗ';
        },
        async getWeather() {
            this.weatherData = [];
            // Получаем данные для местоположения для сравнения
            if (this.selectedComparisonLocation) {
                const comparisonCoords = this.selectedComparisonLocation;
                this.comparisonLatitude = comparisonCoords.lat;
                this.comparisonLongitude = comparisonCoords.lon;
            }


            try {
                for (const index in this.selectedLocations) {
                    const response = await axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact`, {
                        params: {
                            lat: this.selectedLocations[index].lat,
                            lon: this.selectedLocations[index].lon,
                        },
                    });
                    this.weatherData.push(response.data);
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