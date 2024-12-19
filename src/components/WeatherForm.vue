<template>
    <div>

        <v-navigation-drawer app v-model="drawer" permanent width="360">
            <v-toolbar flat>
                <v-toolbar-title>Меню</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon @click="drawer = false">
                    <v-icon>mdi-chevron-left</v-icon>
                </v-btn>

            </v-toolbar>

            <v-form ref="form" @submit.prevent="getWeather" width="100%">
                <v-container fluid>

                    <v-row>
                        <v-col cols="12" md="12" v-for="(location, index) in selectedLocations" :key="index">
                            <v-autocomplete v-model="selectedLocations[index]" :items="locations" label="Выберите место"
                                required item-text="title" item-value="value" variant="outlined" hide-details
                                density="comfortable" :rules="[rules.required]" :search-input.sync="search"
                                @update:search-input="onSearch" clearable>
                                <template v-slot:selection="{ item }">
                                    <div>{{ item ? item.title : 'Выберите место' }}</div>
                                </template>
                            </v-autocomplete>
                        </v-col>
                    </v-row>
                    <div class="d-flex mt-4">
                        <v-tooltip text="Tooltip">
                            <template v-slot:activator="{ props }">
                                <v-btn icon type="submit" v-bind="props"
                                    color="primary"><v-icon>mdi-chart-bar-stacked</v-icon></v-btn>
                            </template>
                            Получить погоду
                        </v-tooltip>
                        <v-spacer></v-spacer>
                        <DialogForMap @updateCoords="updateCoords" :coords="getFirstCoords" :layer="mapslayer" />
                        <v-spacer></v-spacer>
                        <v-tooltip text="Добавить к сравнению">
                            <template v-slot:activator="{ props }">
                                <v-btn icon @click="addLocation" v-bind="props"><v-icon>mdi-plus</v-icon></v-btn>
                            </template>
                        </v-tooltip>

                    </div>
                </v-container>
            </v-form>

            <v-form ref="customForm" @submit.prevent="getCustomWeather" width="100%">

                <v-container fluid>
                    <v-row>
                        <v-col cols="12" xs="12">
                            <v-text-field v-model="customName" label="Место" variant="outlined" hide-details="auto"
                                density="comfortable" required :rules="[rules.required]"></v-text-field>
                        </v-col>
                        <v-col cols="12" xs="12">
                            <v-text-field v-model="customLat" label="Широта (45.05)" variant="outlined"
                                hide-details="auto" density="comfortable" required
                                :rules="[rules.required, rules.isfloat]"></v-text-field>
                        </v-col>
                        <v-col cols="12" xs="12">
                            <v-text-field v-model="customLon" label="Долгота (41.95)" variant="outlined"
                                hide-details="auto" density="comfortable" required
                                :rules="[rules.required, rules.isfloat]"></v-text-field>
                        </v-col>

                    </v-row>

                    <div class="d-flex mt-4">
                        <v-tooltip text="Tooltip">
                            <template v-slot:activator="{ props }">
                                <v-btn icon type="submit" v-bind="props" color="primary"><v-icon>mdi-plus</v-icon>
                                </v-btn>
                            </template>
                            Добавить место в список
                        </v-tooltip>
                    </div>
                </v-container>
            </v-form>
        </v-navigation-drawer>

        <v-container fluid class="pt-0">
            <Notification ref="notification" />
            <v-toolbar app>
                <div v-show="drawer === false" class="mr-2">
                    <v-btn icon @click="drawer = true" >
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                </div>
                <v-toolbar-title>Погода {{ period }}</v-toolbar-title>


            </v-toolbar>

            <div v-if="weatherData.length && weatherData[0].properties.timeseries.length > 20">
                <WeatherChart :weatherData="weatherData" :selectedLocations="selectedLocations" />


                <v-row>
                    <v-col md="2" v-for="(item, index) in weatherData[0].properties.timeseries" :key="`card-${index}`">
                        <v-card>
                            <v-card-title class="py-0">
                                <small style="font-size:0.8rem;">{{ formatDate(item.time) }}</small>
                            </v-card-title>
                            <v-card-text>
                                <v-row>
                                    <!-- Левая часть - изображение -->
                                    <v-col cols="6" class="pa-1">
                                        <v-img v-if="item.data.next_1_hours && item.data.next_1_hours.summary"
                                            :src="`/icons/${item.data.next_1_hours.summary.symbol_code}.svg`"
                                            height="60"></v-img>
                                        <v-img v-else-if="item.data.next_6_hours && item.data.next_6_hours.summary"
                                            :src="`/icons/${item.data.next_6_hours.summary.symbol_code}.svg`"
                                            height="60"></v-img>
                                        <v-img v-else-if="item.data.next_12_hours && item.data.next_12_hours.summary"
                                            :src="`/icons/${item.data.next_12_hours.summary.symbol_code}.svg`"
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

                <!-- <WeatherDataTable :weatherData=weatherData :selectedLocations="selectedLocations" /> -->
            </div>



        </v-container>
    </div>


</template>

<script>
import axios from 'axios';
import WeatherChart from './WeatherChart.vue';
import WeatherDataTable from './WeatherDataTable.vue';
import Notification from './Notification.vue';
import DialogForMap from './DialogForMap.vue';



import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
    name: 'WeatherForm',
    components: {
        WeatherDataTable, WeatherChart, DialogForMap, Notification,
    },
    data() {
        return {
            mapslayer: 'openstreetmap',
            drawer: false,
            selectedLocations: [''],
            locations: [],
            weatherData: [],
            rules: {
                required: value => !!value || 'Поле должно быть заплнено',
                isfloat: value => {
                    return /^\d{2}\.\d{1,3}$/.test(value) || 'Должны быть цифры и точка. ##.###';
                },
                counter: value => value.length <= 20 || 'Max 20 characters',
                email: value => {
                    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    return pattern.test(value) || 'Invalid e-mail.'
                },

            },
            customName: '',
            customLat: '',
            customLon: '',
        };
    },
    mounted() {
        this.fetchLocations();
    },
    computed: {
        isXs() {
            return this.$vuetify.display.xs;
        },
        getFirstCoords() {
            if (this.selectedLocations[0]) {
                return [this.selectedLocations[0].lat, this.selectedLocations[0].lon];
            }
            return [];
        },
        period() {
            if (this.weatherData.length > 0 && this.weatherData[0].properties.timeseries.length > 20) {
                const data = this.weatherData[0].properties.timeseries;
                const fistTime = this.formatDate(data[0].time);
                const lastTime = this.formatDate(data[data.length - 1].time);
                return `${fistTime} - ${lastTime}`;
            }
            return '';
        },

    },
    methods: {
        addNotification(message, succes) {
            this.$refs.notification.notify(message, 'success');
        },
        updateCoords(coords) {
            this.customLat = coords.lat;
            this.customLon = coords.lon;
        },
        async getCustomWeather() {
            const { valid } = await this.$refs.customForm.validate();
            if (!valid) {
                return;
            }
            const custom = {
                "title": this.customName,
                "value": {
                    "label": this.customName,
                    "height": "0",
                    "lat": this.customLat,
                    "lon": this.customLon,
                }
            };

            this.locations.push(custom);
            this.customName = '';
            this.customLat = '';
            this.customLon = '';

            // Вывод сообщения об успешном добавлении (опционально)
            this.addNotification('Локация успешно добавлена!', 'success');
        },
        async fetchLocations() {
            try {
                const response = await fetch(`/locations.json?cacheBust=${new Date().getTime()}`);
                this.locations = await response.json();
                this.selectedLocations[0] = this.locations[0].value;
                this.getWeather();
            } catch (error) {
                console.error('Ошибка при загрузке данных:', error);
            }
        },
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
            try {

                for (const index in this.selectedLocations) {
                    const location = this.selectedLocations[index];

                    if (location && location.lat && location.lon) {

                        try {
                            const response = await axios.get(`https://api.met.no/weatherapi/locationforecast/2.0/compact`, {
                                params: {
                                    lat: location.lat,
                                    lon: location.lon,
                                },
                            });
                            this.weatherData.push(response.data);
                            this.drawer = false;
                        } catch (error) {
                            console.error(`Error fetching weather data for location at index ${index}:`, error);
                        }
                    } else {
                        console.warn(`Location at index ${index} is invalid. Lat: ${location ? location.lat : 'undefined'}, Lon: ${location ? location.lon : 'undefined'}`);
                    }
                };
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