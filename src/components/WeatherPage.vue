<template>
    <div>
        <v-navigation-drawer app v-model="drawer" permanent width="360">
            <v-toolbar flat density="compact">
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
                            <v-autocomplete v-if="locations.length > 0" v-model="selectedLocations[index]"
                                :items="locations" label="Выберите место" required item-text="title" item-value="value"
                                variant="outlined" hide-details density="comfortable" :rules="[rules.required]"
                                :search-input.sync="search" @update:search-input="onSearch" clearable>
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
                        <DialogForMap @updateCoords="updateCoords" :coords="getFirstCoords"
                            :elevation="getFirstElevation" :layer="mapslayer" />
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
                <v-text-field v-model="customName" label="Место" variant="outlined" hide-details="auto"
                    density="compact" required :rules="[rules.required]" class="my-2 mx-4"></v-text-field>
                <v-text-field v-model="customLat" label="Широта (45.05) lat" variant="outlined" hide-details="auto"
                    density="compact" required :rules="[rules.required, rules.isfloat]"
                    class="mb-2 mx-4"></v-text-field>
                <v-text-field v-model="customLon" label="Долгота (41.95) lon" variant="outlined" hide-details="auto"
                    density="compact" required :rules="[rules.required, rules.isfloat]"
                    class="mb-2 mx-4"></v-text-field>
                <v-text-field v-model="customHeight" label="Высота в (м)" variant="outlined" hide-details="auto"
                    density="compact" :rules="[rules.isNumber]" class="mb-2 mx-4"></v-text-field>
                <div class="d-flex mt-4 mx-4">
                    <v-btn icon="mdi-plus" type="submit" color="primary"
                        v-tooltip.bottom="`Добавить место в список`"></v-btn>
                    <v-spacer></v-spacer>
                    <v-btn icon="mdi-content-save" @click="saveLocations" color="primary" :disabled="!isUserAuth"
                        v-tooltip.bottom="`Сохранить список`"></v-btn>
                </div>
            </v-form>
        </v-navigation-drawer>

        <v-container fluid class="pt-0">
            <Notification ref="notification" />
            <v-toolbar app density="compact">
                <div v-show="drawer === false" class="mr-2">
                    <v-btn icon @click="drawer = true">
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
import api from '../Auth/api';
import axios from 'axios';
import WeatherChart from './WeatherChart.vue';
import WeatherDataTable from './WeatherDataTable.vue';
import Notification from './Notification.vue';
import DialogForMap from './DialogForMap.vue';

import { mapGetters } from 'vuex';

import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export default {
    name: 'WeatherPage',
    components: {
        WeatherDataTable, WeatherChart, DialogForMap, Notification,
    },

    data() {
        return {
            search: '',
            mapslayer: 'openstreetmap',
            drawer: false,
            selectedLocations: [],
            locations: [],
            weatherData: [],
            rules: {
                required: value => !!value || 'Поле должно быть заплнено',
                isfloat: value => {
                    return /^\d{2}\.\d{1,5}$/.test(value) || 'Должны быть цифры и точка. ##.#####';
                },
                isNumber: value => {
                    return /^\d{1,8}$/.test(value) || 'Должна быть цифра до 8 знаков';

                },
                counter: value => value.length <= 20 || 'Max 20 characters',
                email: value => {
                    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    return pattern.test(value) || 'Invalid e-mail.'
                },

            },
            customName: '',
            customLat: 0,
            customLon: 0,
            customHeight: 0,
        };
    },
    mounted() {
        this.fetchLocations();
    },
    watch:{
        selectedLocations: {
            handler(newValue, oldValue) {
                console.log('newValue', newValue);
                // Проверяем, изменился ли первый элемент массива
                //if (newValue[0] !== oldValue[0]) {
                    this.customName = newValue[0].label;
                    this.customLat = newValue[0].lat;
                    this.customLon = newValue[0].lon;
                    this.customHeight = newValue[0].heigth;
                    console.log(this.customHeight,'this.customHeight');
                    ///this.getWeather(); // Вызываем getWeather при изменении первого элемента
               // }
            },
            deep: true // Убедитесь, что отслеживаются вложенные изменения
        }


    },
    computed: {
        ...mapGetters(['isUserAuth', 'isUserAdmin']),
        isXs() {
            return this.$vuetify.display.xs;
        },
        getFirstCoords() {
            if (this.selectedLocations[0]) {
                return [this.selectedLocations[0].lat, this.selectedLocations[0].lon];
            }
            return [];
        },
        getFirstElevation() {
            if (this.selectedLocations.length > 0) {
                return parseInt(this.selectedLocations[0].heigth) || 0;
            }
            return 0;
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
        async fetchLocations() {
            try {
                const response = await api.downloadLocations();
                this.locations = response.data;
                if (this.locations.length > 0) {
                    const location = this.locations.find(item => item.title.includes('Ставрополь'));
                    this.selectedLocations[0] = location.value;
                    this.getWeather();
                    this.locations.sort((a, b) => {
                        if (a.title < b.title) return -1; // a идет перед b
                        if (a.title > b.title) return 1;  // a идет после b
                        return 0; // a и b равны
                    });
                    // this.customName = this.selectedLocations[0].label;
                    // this.customLat = this.selectedLocations[0].lat;
                    // this.customLon = this.selectedLocations[0].lon;
                    // this.customHeight = this.selectedLocations[0].heigth;

                }
            } catch (error) {
                console.error("Ошибка при загрузке locations:", error);
                const response = await fetch(`/locations.json?cacheBust=${new Date().getTime()}`);
                this.locations = await response.json();
                this.selectedLocations[0] = this.locations[0].value;
                this.getWeather();
            }
        },
        async saveLocations() {
            this.loading = true;
            try {
                const response = await api.uploadLocations(this.locations);
                const data = response.data;
                this.message(data.message, 'info');

            } catch (error) {
                this.errors = error.response.data.errors;
                console.error("Ошибка при выгрузки", error);
            } finally {
                this.loading = false;

            }
        },
        onSearch() {
            return true;
        },
        addNotification(message, succes) {
            this.$refs.notification.notify(message, 'success');
        },
        updateCoords(coords) {
            this.customLat = coords.lat;
            this.customLon = coords.lng;
            this.customHeight = coords.height;
        },
        async getCustomWeather() {
            const { valid } = await this.$refs.customForm.validate();
            if (!valid) {
                return;
            }
            console.log('custom',this.customHeight);
            const custom = {
                "title": this.customName,
                "value": {
                    "label": this.customName,
                    "heigth": parseInt(this.customHeight) || 0,
                    "lat": this.customLat,
                    "lon": this.customLon,
                }
            };

            this.locations.push(custom);
            this.customName = '';
            this.customLat = 0;
            this.customLon = 0;
            this.customHeight = 0;

            // Вывод сообщения об успешном добавлении (опционально)
            this.addNotification('Локация успешно добавлена!', 'success');
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
                                    //для точности здесь может быть altitude=высота на котоорой находиться поверхнось  
                                    altitude: location.heigth,
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